import { toSafeUser } from '@/auth/types.js';
import prisma from '@/prisma.js';
import { emailSchema, nameSchema, usernameSchema } from '@shared/validation.js';
import express from 'express';
import { EMAIL_INTERVAL } from '@shared/consts.js';

const settingsRouter = express.Router();

// Change name

settingsRouter.post('/name', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const validation = nameSchema.safeParse(req.body.name);

    if (!validation.success) {
        return res.status(400).json({
            errors: {
                name: validation.error.issues[0].message,
            },
        });
    }

    const name = req.body.name as string | undefined;

    // Reset name
    if (!name || name.trim().length === 0) {
        try {
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: { name: null },
            });

            return res.status(200).json({ user: toSafeUser(user) });
        } catch (e) {
            return res
                .status(500)
                .json({ errors: { root: 'Internal Server Error' } });
        }
    }

    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name },
        });

        res.json({ user: toSafeUser(user) });
    } catch (e) {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});

// Change username

settingsRouter.post('/username', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const validation = usernameSchema.safeParse(req.body.username);

    if (!validation.success) {
        return res.status(400).json({
            errors: {
                username: validation.error.issues[0].message,
            },
        });
    }

    const username = req.body.username as string | undefined;

    if (!username) {
        return res
            .status(400)
            .json({ errors: { username: 'Username is required' } });
    }

    try {
        const existing = await prisma.user.findUnique({ where: { username } });

        if (existing) {
            return res
                .status(400)
                .json({ errors: { username: 'Username is already taken' } });
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { username },
        });

        res.json({ user: toSafeUser(user) });
    } catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});

// Send verification "email"

function generateToken(): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

async function sendVerificationEmail(userId: string) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    await prisma.verificationEmail.create({
        data: {
            userId,
            type: 'verify_email',
            token,
            expiresAt,
        },
    });

    // <SEND EMAIL>

    return token;
}

// Change email

settingsRouter.post('/email', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const timePassed =
        Date.now() - new Date(req.user.emailVerifiedAt ?? 0).getTime();

    if (timePassed < EMAIL_INTERVAL) {
        return res.status(429).json({
            errors: {
                root: `Please wait ${Math.ceil(
                    (EMAIL_INTERVAL - timePassed) / 1000 / 60
                )} minutes before changing your email again`,
            },
        });
    }

    const email = (req.body.email ?? null) as string | null;

    // If email is null, unlink the email from the account

    if (email === null) {
        try {
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: { email: null, isEmailVerified: false },
            });

            res.status(200).json({
                message: 'Successfully unlinked email',
                user: toSafeUser(user),
            });
        } catch (e) {
            return res
                .status(500)
                .json({ errors: { root: 'Internal Server Error' } });
        }
    } else {
        const validation = emailSchema.safeParse(email);

        if (!validation.success) {
            return res.status(400).json({
                errors: {
                    email: validation.error.issues[0].message,
                },
            });
        }

        try {
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: { email, isEmailVerified: false },
            });

            // Show the token for testing purposes
            // In production, this should be sent via email
            const token = await sendVerificationEmail(req.user.id);

            res.json({ user: toSafeUser(user), token });
        } catch (e) {
            return res
                .status(500)
                .json({ errors: { root: 'Internal Server Error' } });
        }
    }
});

// Resend verification email

settingsRouter.post('/email/resend-verification', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    try {
        // TODO: Logic to resend verification email

        // Check if enough time has passed since the last verification email
        const timePassed =
            Date.now() - new Date(req.user.emailVerifiedAt ?? 0).getTime();

        if (timePassed < EMAIL_INTERVAL) {
            return res.status(429).json({
                errors: {
                    root: `Please wait ${Math.ceil(
                        (EMAIL_INTERVAL - timePassed) / 1000 / 60
                    )} minutes before resending the verification email`,
                },
            });
        }

        await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                emailVerifiedAt: new Date(),
                isEmailVerified: false,
            },
        });

        const token = await sendVerificationEmail(req.user.id);

        res.status(200).json({ token });
    } catch (e) {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});

settingsRouter.post('/email/verify', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const token = req.body.token as string | undefined;

    if (!token) {
        return res.status(400).json({ errors: { token: 'Token is required' } });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ errors: { root: 'User not found' } });
        }

        const verificationRecord = await prisma.verificationEmail.findFirst({
            where: {
                userId: user.id,
                token,
            },
        });

        if (
            !verificationRecord ||
            verificationRecord.expiresAt < new Date() ||
            verificationRecord.deletedAt
        ) {
            return res.status(400).json({ errors: { root: 'Invalid token' } });
        }

        // Update the user's email verification status

        const newUser = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.update({
                where: { id: user.id },
                data: { isEmailVerified: true },
            });

            await tx.verificationEmail.update({
                where: { userId: user.id, token },
                data: { deletedAt: new Date() },
            });

            return newUser;
        });

        res.status(200).json({ user: toSafeUser(newUser) });
    } catch (e) {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});

export default settingsRouter;
