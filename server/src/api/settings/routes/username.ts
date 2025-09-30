// Change username

import { toSafeUser } from '@/auth/types.js';
import prisma from '@/prisma.js';
import settingsRouter from '../router.js';
import { usernameSchema } from '@shared/validation.js';

settingsRouter.post('/username', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
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
