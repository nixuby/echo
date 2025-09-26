import prisma from '@/prisma.js';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {
    ClientNotification,
    NOTIFICATION_TYPES,
    NotificationType,
    OtherClientUser,
    ServerNotification,
} from '@shared/types.js';
import {
    createNotification,
    parseNotificationSettings,
    toClientNotification,
} from '@/notifications.js';
import { Notification, Prisma } from 'generated/prisma/index.js';

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

usersRouter.post('/pic', async (req, res) => {
    const UPLOAD_DIRECTORY_PATH = path.join(__dirname, 'uploads', 'pictures');
    const IMAGE_SIZE_SMALL = 128;
    const IMAGE_SIZE_LARGE = 512;

    if (!existsSync(UPLOAD_DIRECTORY_PATH)) {
        await fs.mkdir(UPLOAD_DIRECTORY_PATH, { recursive: true });
    }

    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    // File as Base64
    const fileBase64 = req.body.picture;

    if (!fileBase64) {
        return res
            .status(400)
            .json({ errors: { root: 'No picture provided' } });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    // Output paths

    const fullOutputPath = path.join(
        UPLOAD_DIRECTORY_PATH,
        `${req.user.username}.jpg`
    );
    const previewOutputPath = path.join(
        UPLOAD_DIRECTORY_PATH,
        `${req.user.username}-sm.jpg`
    );

    // Create the images

    try {
        const fullPicture = sharp(buffer);
        const previewPicture = fullPicture.clone();

        // Resize the pictures

        fullPicture.resize({
            width: IMAGE_SIZE_LARGE,
            height: IMAGE_SIZE_LARGE,
            fit: sharp.fit.cover,
        });

        previewPicture.resize({
            width: IMAGE_SIZE_SMALL,
            height: IMAGE_SIZE_SMALL,
            fit: sharp.fit.cover,
        });

        // Save the pictures

        await Promise.all([
            fullPicture.toFile(fullOutputPath),
            previewPicture.toFile(previewOutputPath),
        ]);

        return res.status(204).end();
    } catch (error) {
        return res
            .status(500)
            .json({ errors: { root: 'Failed to save picture' } });
    }
});

usersRouter.post('/bio', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const bio = req.body.bio;

    if (typeof bio !== 'string' || bio.length > 160) {
        return res.status(400).json({
            errors: { root: 'Bio must be a string up to 160 characters' },
        });
    }

    await prisma.user.update({
        where: { id: req.user.id },
        data: { bio },
    });

    return res.status(204).end();
});

async function toClientNotifications(
    tx: Prisma.TransactionClient,
    notifications: Array<ServerNotification>
): Promise<Array<ClientNotification>> {
    const clientNotifs: Array<ClientNotification> = [];

    for (const notif of notifications) {
        const clientNotif = await toClientNotification(tx, notif);
        clientNotifs.push(clientNotif);
    }

    return clientNotifs;
}

usersRouter.get('/notifications', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const page = Number(req.query.page || '0');

    if (isNaN(page) || page < 0) {
        return res
            .status(400)
            .json({ errors: { root: 'Invalid page number' } });
    }

    const clientNotifs = await prisma.$transaction(async (tx) => {
        const notificationsRaw = await tx.notification.findMany({
            where: { userId: req.user!.id },
            select: {
                id: true,
                type: true,
                data: true,
                isRead: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: page * 10,
            take: 10,
        });

        for (const notif of notificationsRaw) {
            notif.data = JSON.parse(notif.data);
        }

        const notifications =
            notificationsRaw as any as Array<ServerNotification>;

        const clientNotifs = await toClientNotifications(tx, notifications);

        // mark as read

        await tx.notification.updateMany({
            where: { id: { in: notifications.map((n) => n.id) } },
            data: { isRead: true },
        });

        return clientNotifs;
    });

    res.json(clientNotifs);
});

usersRouter.get('/notification-settings', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const settings = parseNotificationSettings(
        (
            await prisma.user.findUnique({
                where: {
                    id: req.user.id,
                },
                select: {
                    notificationSettings: true,
                },
            })
        )?.notificationSettings
    );

    res.json(settings);
});

usersRouter.post('/notification-settings', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const type = req.body.type as NotificationType;

    if (
        !type ||
        typeof type !== 'string' ||
        !NOTIFICATION_TYPES.includes(type)
    ) {
        return res.status(400).json({
            errors: { root: 'Invalid or missing notification type' },
        });
    }

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: req.user!.id },
            select: { notificationSettings: true },
        });

        const settings = parseNotificationSettings(user?.notificationSettings);

        if (!settings) {
            throw new Error('Failed to parse notification settings');
        }

        settings[type] = !settings[type];

        await tx.user.update({
            where: { id: req.user!.id },
            data: { notificationSettings: JSON.stringify(settings) },
        });

        return settings[type];
    });

    return res.status(200).json(result);
});

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

usersRouter.post('/follow/:username', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const usernameToFollow = req.params.username;

    if (!usernameToFollow || typeof usernameToFollow !== 'string') {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    if (usernameToFollow === req.user.username) {
        return res
            .status(400)
            .json({ errors: { root: 'You cannot follow yourself' } });
    }

    const isFollowed = await prisma.$transaction(async (tx) => {
        const userToFollow = await tx.user.findUnique({
            where: { username: usernameToFollow },
            select: { id: true },
        });

        if (!userToFollow) {
            res.status(404).json({ errors: { root: 'User not found' } });
            return;
        }

        const alreadyFollowing = await tx.userFollow.findUnique({
            where: {
                followerId_followsId: {
                    followerId: req.user!.id,
                    followsId: userToFollow.id,
                },
            },
        });

        if (alreadyFollowing) {
            await tx.userFollow.delete({
                where: {
                    followerId_followsId: {
                        followerId: req.user!.id,
                        followsId: userToFollow.id,
                    },
                },
            });
            return false;
        } else {
            await tx.userFollow.create({
                data: {
                    followerId: req.user!.id,
                    followsId: userToFollow.id,
                },
            });

            await createNotification(
                userToFollow.id,
                {
                    type: 'new_follower',
                    data: { userId: req.user!.id },
                },
                tx
            );

            return true;
        }
    });

    return res.status(200).json(isFollowed);
});

usersRouter.get('/user/:username', async (req, res) => {
    const username = req.params.username;

    if (username.length === 0) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const [prUser, followedByMe] = (await prisma.$transaction(async (tx) => {
        const prUser = await tx.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: {
                            where: { type: 'ORIGINAL' },
                        },
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        const followedByMe =
            req.user && prUser
                ? await tx.userFollow.findUnique({
                      where: {
                          followerId_followsId: {
                              followerId: req.user.id,
                              followsId: prUser.id,
                          },
                      },
                  })
                : false;

        return [prUser, Boolean(followedByMe)];
    })) as [
        {
            id: string;
            username: string;
            name: string | null;
            bio: string;
            createdAt: Date;
            isVerified: boolean;
            _count: {
                posts: number;
                following: number;
                followers: number;
            };
        } | null,
        boolean
    ];

    if (!prUser) {
        return res.status(404).json({ errors: { root: 'User not found' } });
    }

    return res.json({
        username: prUser.username,
        name: prUser.name,
        bio: prUser.bio,
        isVerified: prUser.isVerified,
        createdAt: prUser.createdAt.toISOString(),
        followerCount: prUser._count.followers,
        followingCount: prUser._count.following,
        postCount: prUser._count.posts,
        followedByMe: followedByMe,
    } satisfies OtherClientUser);
});

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

export default usersRouter;
