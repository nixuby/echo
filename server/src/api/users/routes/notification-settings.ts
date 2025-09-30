import { parseNotificationSettings } from '@/notifications.js';
import usersRouter from '../router.js';
import prisma from '@/prisma.js';
import { NOTIFICATION_TYPES, NotificationType } from '@shared/types.js';

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
