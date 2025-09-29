import express from 'express';
import passport from '@/auth/passport.js';
import prisma from '@/prisma.js';
import { hashPassword } from '@/auth/hash-password.js';
import { toSafeUser } from '@/auth/types.js';
import { createAccountFormSchema, usernameSchema } from '@shared/validation.js';
import sharp from 'sharp';
import path from 'node:path';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';

const authRouter = express.Router();

const __dirname = path.resolve();

authRouter.get('/me', (req, res) => {
    if (!req.user)
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    res.json({ user: req.user });
});

authRouter.post('/sign-in', (req, res, next) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({
            errors: { root: 'auth.missing-credentials' },
        });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({
                errors: {
                    root: info?.message || 'auth.invalid-credentials',
                },
            });
        }

        req.login(user, (err2) => {
            if (err2) return next(err2);
            res.json({ user });
        });
    })(req, res, next);
});

authRouter.post('/create-account', async (req, res, next) => {
    const { username, password, confirm, tos } = req.body ?? {};

    if (!username || !password || !confirm || !tos) {
        return res.status(400).json({
            errors: { root: 'auth.missing-fields' },
        });
    }

    if (password !== confirm) {
        return res.status(400).json({
            errors: { confirm: 'auth.password.mismatch' },
        });
    }

    const validation = createAccountFormSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            errors: {
                root: 'validation-failed',
                // Other validation errors are handled on the client
            },
        });
    }

    const existing = await prisma.user.findUnique({
        where: { username },
    });

    if (existing)
        return res.status(409).json({
            errors: { username: 'username.taken' },
        });

    const hash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            username,
            password: hash,
        },
    });

    const safeUser = toSafeUser(user);

    req.login(user as any, (err2) => {
        if (err2)
            return res
                .status(500)
                .json({ errors: { root: 'auth.autologin-failed' } });
        res.json({ user: safeUser });
    });
});

authRouter.post('/sign-out', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json(null);
    });
});

async function fetchGoogleUserInfo(accessToken: string) {
    const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        }
    );
    const data = (await response.json()) as {
        sub: number;
        name: string;
        picture: string;
    };
    return data;
}

authRouter.get('/oauth/google/profile-info', async (req, res) => {
    const accessToken = req.query.accessToken as string | undefined;

    if (!accessToken) {
        return res
            .status(400)
            .json({ errors: { root: 'oauth.missing-access-token' } });
    }

    try {
        const data = await fetchGoogleUserInfo(accessToken);

        const uid = String(data.sub);
        const name = data.name;
        const picture = data.picture;

        const exists =
            (await prisma.user.findUnique({
                where: {
                    provider_providerId: {
                        provider: 'google',
                        providerId: uid,
                    },
                },
            })) !== null;

        res.json({ uid, name, picture, exists });
    } catch (err) {
        res.status(500).json({
            errors: { root: 'oauth.unable-to-fetch-profile' },
        });
    }
});

authRouter.post('/oauth/google/sign-in', async (req, res, next) => {
    const { accessToken, username } = req.body ?? {};

    if (!accessToken) {
        return res.status(400).json({
            errors: { root: 'auth.missing-fields' },
        });
    }

    try {
        const profile = await fetchGoogleUserInfo(accessToken);

        const uid = String(profile.sub);

        const exists = await prisma.user.findUnique({
            where: {
                provider_providerId: {
                    provider: 'google',
                    providerId: uid,
                },
            },
        });

        // if exists, signin
        if (exists) {
            req.login(exists as any, (err2) => {
                if (err2)
                    return res
                        .status(500)
                        .json({ errors: { root: 'auth.autologin-failed' } });
                res.json({ user: toSafeUser(exists) });
            });
            return;
        }
        // if doesnt, create account
        else {
            if (!username) {
                return res.status(400).json({
                    errors: { root: 'auth.missing-fields' },
                });
            }

            const validation = usernameSchema.safeParse(username);

            if (!validation.success) {
                return res.status(400).json({
                    errors: {
                        username: validation.error.issues[0].message,
                    },
                });
            }

            const usernameTaken =
                (await prisma.user.findUnique({
                    where: { username },
                })) !== null;

            if (usernameTaken) {
                return res.status(409).json({
                    errors: { username: 'username.taken' },
                });
            }

            const user = await prisma.user.create({
                data: {
                    username,
                    name: profile.name,
                    provider: 'google',
                    providerId: uid,
                },
            });

            // Upload picture to our server
            const UPLOAD_DIRECTORY_PATH = path.join(
                __dirname,
                'uploads',
                'pictures'
            );

            const IMAGE_SIZE_SMALL = 128;
            const IMAGE_SIZE_LARGE = 512;

            if (!existsSync(UPLOAD_DIRECTORY_PATH)) {
                await fs.mkdir(UPLOAD_DIRECTORY_PATH, { recursive: true });
            }

            const fullOutputPath = path.join(
                UPLOAD_DIRECTORY_PATH,
                `${username}.jpg`
            );
            const previewOutputPath = path.join(
                UPLOAD_DIRECTORY_PATH,
                `${username}-sm.jpg`
            );

            const picture = await fetch(profile.picture);
            const pictureBlob = await picture.blob();
            const sharpImage = sharp(
                Buffer.from(await pictureBlob.arrayBuffer())
            );
            const sharpImageSm = sharpImage.clone();
            sharpImage.resize({
                width: IMAGE_SIZE_LARGE,
                height: IMAGE_SIZE_LARGE,
                fit: sharp.fit.cover,
            });

            sharpImageSm.resize({
                width: IMAGE_SIZE_SMALL,
                height: IMAGE_SIZE_SMALL,
                fit: sharp.fit.cover,
            });

            await Promise.all([
                sharpImage.toFile(fullOutputPath),
                sharpImageSm.toFile(previewOutputPath),
            ]);

            const safeUser = toSafeUser(user);

            req.login(user as any, (err2) => {
                if (err2)
                    return res
                        .status(500)
                        .json({ errors: { root: 'auth.autologin-failed' } });
                res.json({ user: safeUser });
            });

            return;
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            errors: { root: 'server-error' },
        });
    }
});
export default authRouter;
