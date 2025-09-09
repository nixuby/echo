import prisma from '@/prisma.js';
import { OTHER_CLIENT_USER_SELECT } from '@shared/types.js';
import express from 'express';

const usersRouter = express.Router();

usersRouter.get('/:splat', async (req, res) => {
    const splat = req.params.splat;

    if (splat.length === 0) {
        res.status(400).json({ errors: { root: 'Invalid request' } });
        return;
    }

    if (splat[0] === '@') {
        const username = splat.slice(1);

        const user = await prisma.user.findUnique({
            where: { username },
            select: OTHER_CLIENT_USER_SELECT,
        });

        if (!user) {
            res.status(404).json({ errors: { root: 'User not found' } });
            return;
        }

        res.json(user);
    }

    res.status(400).json({ errors: { root: 'Invalid request' } });
});

export default usersRouter;
