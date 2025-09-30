import prisma from '@/prisma.js';
import usersRouter from '../../router.js';

usersRouter.post('/chat/:chatId/', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const chatId = req.params.chatId;

    if (!chatId || typeof chatId !== 'string') {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const content = req.body.content;

    if (!content || typeof content !== 'string' || content.length === 0) {
        return res.status(400).json({ errors: { root: 'Invalid message' } });
    }

    const message = await prisma.$transaction(async (tx) => {
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

        return await tx.chatMessage.create({
            data: {
                chatId,
                senderId: req.user!.id,
                content,
            },
            select: {
                id: true,
                sender: {
                    select: {
                        name: true,
                        username: true,
                        isVerified: true,
                    },
                },
                content: true,
                createdAt: true,
            },
        });
    });

    return res.json(message);
});
