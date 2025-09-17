import {
    ClientNotification,
    NOTIFICATION_TYPES,
    NotificationSettings,
    NotificationType,
    NotificationUser,
    ServerNotification,
} from '@shared/types.js';
import prisma from './prisma.js';
import { Prisma } from 'generated/prisma/index.js';

export function parseNotificationSettings(
    str?: string | null
): NotificationSettings | null {
    if (!str) return null;
    try {
        const obj = JSON.parse(str);
        for (const type of NOTIFICATION_TYPES) {
            if (typeof obj[type] !== 'boolean') {
                obj[type] = true;
            }
            obj[type] = Boolean(obj[type]);
        }
        return obj as NotificationSettings;
    } catch {
        return null;
    }
}

async function createNotificationTx(
    tx: Prisma.TransactionClient,
    userId: string,
    notification: Omit<ServerNotification, 'isRead' | 'createdAt' | 'id'>
) {
    const existing = await tx.notification.findMany({
        where: {
            userId,
            data: JSON.stringify(notification.data),
            type: notification.type,
        },
    });
    if (existing.length > 0) {
        return;
    }

    const notifSettings = (
        await tx.user.findUnique({
            where: { id: userId },
            select: { notificationSettings: true },
        })
    )?.notificationSettings;

    const settings = parseNotificationSettings(notifSettings);

    if (!settings || settings[notification.type] === false) {
        return;
    }

    await tx.notification.create({
        data: {
            userId,
            type: notification.type,
            data: JSON.stringify(notification.data),
        },
    });
}

// Attempt to create a notification for a user
export async function createNotification(
    userId: string,
    notification: Omit<ServerNotification, 'isRead' | 'createdAt' | 'id'>,
    tx?: Prisma.TransactionClient
) {
    if (tx) {
        await createNotificationTx(tx, userId, notification);
    } else {
        await prisma.$transaction(async (tx) => {
            await createNotificationTx(tx, userId, notification);
        });
    }
}

// Fetch notification user
async function fetchUser(
    tx: Prisma.TransactionClient,
    userId: string
): Promise<NotificationUser | null> {
    const user = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true, username: true, isVerified: true },
    });
    return user ? (user satisfies NotificationUser) : null;
}

export async function toClientNotification(
    tx: Prisma.TransactionClient,
    notif: ServerNotification
): Promise<ClientNotification> {
    const { type, data, isRead } = notif;
    const createdAt = notif.createdAt.toISOString();
    switch (type) {
        case 'post_liked': {
            const { postId, userId } = data;
            const user = await fetchUser(tx, userId);
            if (!user) throw new Error('User not found');
            return {
                ...notif,
                createdAt,
                data: {
                    postId,
                    user,
                },
            };
        }

        case 'new_follower': {
            const { userId } = data;
            const user = await fetchUser(tx, userId);
            if (!user) throw new Error('User not found');
            return {
                ...notif,
                createdAt,
                data: {
                    user,
                },
            };
        }

        case 'post_replied': {
            const { postId, userId } = data;
            const user = await fetchUser(tx, userId);
            if (!user) throw new Error('User not found');
            return {
                ...notif,
                createdAt,
                data: {
                    postId,
                    user,
                },
            };
        }

        case 'post_shared': {
            const { postId, userId } = data;
            const user = await fetchUser(tx, userId);
            if (!user) throw new Error('User not found');
            return {
                ...notif,
                createdAt,
                data: {
                    postId,
                    user,
                },
            };
        }
    }
}
