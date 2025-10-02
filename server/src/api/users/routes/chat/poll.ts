import prisma from '@/prisma.js';
import usersRouter from '../../router.js';

usersRouter.get('/chat/:chatId/poll/', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const chatId = req.params.chatId;
    const since = req.query.since; // string or undefined

    if (typeof since !== 'string') {
        return res.status(204).end();
    }

    const sinceDate = new Date(since);

    if (!chatId || typeof chatId !== 'string') {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const userId = req.user.id;

    const messages = await prisma.$transaction(async (tx) => {
        const isParticipant = await tx.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId,
                    userId: userId,
                },
            },
        });

        if (!isParticipant) {
            res.status(403).json({ errors: { root: 'Forbidden' } });
            return;
        }

        const messages = await tx.chatMessage.findMany({
            where: {
                AND: {
                    chatId,
                    createdAt: { gt: sinceDate },
                    senderId: { not: userId },
                },
            },
            select: {
                id: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        isVerified: true,
                    },
                },
                content: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return messages;
    });

    return res.json(messages);
});
