import prisma from '@/prisma.js';
import usersRouter from '../../router.js';

usersRouter.post('/chat/new/:username', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    // Create a chat with the user if it doesn't exist

    const usernameToChat = req.params.username;

    if (!usernameToChat || typeof usernameToChat !== 'string') {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    if (usernameToChat === req.user.username) {
        return res
            .status(400)
            .json({ errors: { root: 'You cannot chat with yourself' } });
    }

    const chatId = await prisma.$transaction(async (tx) => {
        const userToChat = await tx.user.findUnique({
            where: { username: usernameToChat },
            select: { id: true },
        });

        if (!userToChat) {
            res.status(404).json({ errors: { root: 'User not found' } });
            return;
        }

        const existingChat = await tx.chatParticipant.findMany({
            where: {
                userId: { in: [req.user!.id, userToChat.id] },
                chat: {
                    participants: {
                        every: {
                            userId: { in: [req.user!.id, userToChat.id] },
                        },
                    },
                },
            },
            select: { chatId: true },
        });

        if (existingChat.length >= 2) {
            return existingChat[0].chatId;
        }

        const newChat = await tx.chat.create({
            data: {
                participants: {
                    create: [
                        { userId: req.user!.id },
                        { userId: userToChat.id },
                    ],
                },
            },
            select: { id: true },
        });

        return newChat.id;
    });

    if (chatId) res.json(chatId);
});
