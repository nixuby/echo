import prisma from '@/prisma.js';
import usersRouter from '../../router.js';

usersRouter.get('/chats', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const chats = await prisma.chat.findMany({
        where: {
            participants: { some: { userId: req.user.id } },
            messages: { some: {} },
        },
        select: {
            id: true,
            participants: {
                select: {
                    user: {
                        select: {
                            username: true,
                            name: true,
                            isVerified: true,
                        },
                    },
                },
                where: { userId: { not: req.user.id } },
                take: 1,
            },
        },
    });

    res.json(
        chats.map((chat) => ({
            id: chat.id,
            user: chat.participants[0].user,
        }))
    );
});
