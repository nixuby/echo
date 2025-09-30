// Resend verification email

import { EMAIL_INTERVAL } from '@shared/consts.js';
import settingsRouter from '../router.js';
import prisma from '@/prisma.js';
import sendVerificationEmail from '../util/send-verification-email.js';

settingsRouter.post('/email/resend-verification', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    try {
        // TODO: Logic to resend verification email

        // Check if enough time has passed since the last verification email
        const timePassed =
            Date.now() - new Date(req.user.emailVerifiedAt ?? 0).getTime();

        if (timePassed < EMAIL_INTERVAL) {
            return res.status(429).json({
                errors: {
                    root: `Please wait ${Math.ceil(
                        (EMAIL_INTERVAL - timePassed) / 1000 / 60
                    )} minutes before resending the verification email`,
                },
            });
        }

        await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                emailVerifiedAt: new Date(),
                isEmailVerified: false,
            },
        });

        const token = await sendVerificationEmail(req.user.id);

        res.status(200).json({ token });
    } catch (e) {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});
