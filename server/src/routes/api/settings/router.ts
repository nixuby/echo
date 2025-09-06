import { toSafeUser } from '@/auth/types.js';
import prisma from '@/prisma.js';
import { emailSchema, usernameSchema } from '@shared/validation.js';
import express from 'express';
import z from 'zod';

const settingsRouter = express.Router();

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

// Change email

settingsRouter.post('/email', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
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

            res.json({ user: toSafeUser(user) });
        } catch (e) {
            return res
                .status(500)
                .json({ errors: { root: 'Internal Server Error' } });
        }
    }
});

export default settingsRouter;
