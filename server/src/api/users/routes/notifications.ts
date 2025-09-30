import { toClientNotification } from '@/notifications.js';
import { ClientNotification, ServerNotification } from '@shared/types.js';
import { Prisma } from 'generated/prisma/index.js';
import usersRouter from '../router.js';
import prisma from '@/prisma.js';

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
