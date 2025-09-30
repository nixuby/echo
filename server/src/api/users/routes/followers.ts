import prisma from '@/prisma.js';
import usersRouter from '../router.js';

async function getFollowers(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username,
        },
        select: {
            followers: {
                select: {
                    follower: {
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

    return user?.followers ?? [];
}

usersRouter.get('/followers/:username', async (req, res) => {
    const username = req.params.username;
    if (!username) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }
    return res.json(await getFollowers(username));
});

usersRouter.get('/followers', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }
    return res.json(await getFollowers(req.user.username));
});
