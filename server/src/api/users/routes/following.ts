import prisma from '@/prisma.js';
import usersRouter from '../router.js';

async function getFollowing(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username,
        },
        select: {
            following: {
                select: {
                    follows: {
                        select: {
                            username: true,
                            name: true,
                            isVerified: true,
                        },
                    },
                },
            },
        },
    });

    return user?.following ?? [];
}

usersRouter.get('/following/:username', async (req, res) => {
    const username = req.params.username;
    if (!username) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }
    return res.json(await getFollowing(username));
});

usersRouter.get('/following', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }
    return res.json(await getFollowing(req.user.username));
});
