import express from 'express';
import passport from '@/auth/passport.js';
import prisma from '@/prisma.js';
import { hashPassword } from '@/auth/hash-password.js';
import { toSafeUser } from '@/auth/types.js';
import { createAccountFormSchema } from '@shared/validation.js';

const authRouter = express.Router();

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

export default authRouter;
