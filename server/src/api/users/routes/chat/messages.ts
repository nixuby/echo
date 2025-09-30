import prisma from '@/prisma.js';
import usersRouter from '../../router.js';

usersRouter.get('/chat/:chatId/messages', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const chatId = req.params.chatId;

    if (!chatId || typeof chatId !== 'string') {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const messages = await prisma.$transaction(async (tx) => {
        const isParticipant = await tx.chatParticipant.findUnique({
            where: {
                chatId_userId: {
                    chatId,
                    userId: req.user!.id,
                },
            },
        });

        if (!isParticipant) {
            res.status(403).json({ errors: { root: 'Forbidden' } });
            return;
        }

        const messages = await tx.chatMessage.findMany({
            where: { chatId },
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
        });

        return messages;
    });

    if (messages) res.json(messages);
});
