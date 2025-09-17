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
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
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
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
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
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
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
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
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
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
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

// TODO: move to "/user/:username" to prevent collision
usersRouter.get('/:username', async (req, res) => {
    const username = req.params.username;

    if (username.length === 0) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const prUser = await prisma.user.findUnique({
        where: { username },
        select: {
            username: true,
            name: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                },
            },
        },
    });

    if (!prUser) {
        return res.status(404).json({ errors: { root: 'User not found' } });
    }

    return res.json({
        username: prUser.username,
        name: prUser.name,
        bio: prUser.bio,
        isVerified: prUser.isVerified,
        createdAt: prUser.createdAt.toISOString(),
        postCount: prUser._count.posts,
    } satisfies OtherClientUser);
});

export default usersRouter;
