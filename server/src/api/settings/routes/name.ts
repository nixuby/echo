// Change name

import { nameSchema } from '@shared/validation.js';
import settingsRouter from '../router.js';
import prisma from '@/prisma.js';
import { toSafeUser } from '@/auth/types.js';

settingsRouter.post('/name', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
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
