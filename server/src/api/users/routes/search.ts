import prisma from '@/prisma.js';
import usersRouter from '../router.js';

usersRouter.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query || typeof query !== 'string' || query.length < 3) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query } },
                { name: { contains: query } },
            ],
        },
        select: {
            username: true,
            name: true,
            isVerified: true,
        },
    });

    return res.json(users);
});
