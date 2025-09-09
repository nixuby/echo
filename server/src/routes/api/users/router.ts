import prisma from '@/prisma.js';
import { OTHER_CLIENT_USER_SELECT } from '@shared/types.js';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';

const usersRouter = express.Router();

const __dirname = path.resolve();

usersRouter.get('/pic/:username', async (req, res) => {
    const DEFAULT_PATH = path.join(__dirname, 'res', 'default-pfp.jpg');
    const { username } = req.params;
    const picturePath = path.join(
        __dirname,
        'uploads',
        'pictures',
        `${username}.jpg`
    );

    res.sendFile(existsSync(picturePath) ? picturePath : DEFAULT_PATH, {
        headers: { 'Content-Type': 'image/jpeg' },
    });
});

usersRouter.get('/:splat', async (req, res) => {
    const splat = req.params.splat;

    if (splat.length === 0) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    if (splat[0] === '@') {
        const username = splat.slice(1);

        const user = await prisma.user.findUnique({
            where: { username },
            select: OTHER_CLIENT_USER_SELECT,
        });

        if (!user) {
            return res.status(404).json({ errors: { root: 'User not found' } });
        }

        return res.json(user);
    }

    res.status(400).json({ errors: { root: 'Invalid request' } });
});

export default usersRouter;
