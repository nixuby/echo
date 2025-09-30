import prisma from '@/prisma.js';
import { toSafeUser } from '@/auth/types.js';
import { usernameSchema } from '@shared/validation.js';
import sharp from 'sharp';
import path from 'node:path';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import authRouter from '../../../router.js';
import fetchGoogleUserInfo from '../../../util/fetch-google-user-info.js';

const __dirname = path.resolve();

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
