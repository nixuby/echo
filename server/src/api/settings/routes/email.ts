// Change email

import { EMAIL_INTERVAL } from '@shared/consts.js';
import settingsRouter from '../router.js';
import prisma from '@/prisma.js';
import { toSafeUser } from '@/auth/types.js';
import { emailSchema } from '@shared/validation.js';
import sendVerificationEmail from '../util/send-verification-email.js';

settingsRouter.post('/email', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const timePassed =
        Date.now() - new Date(req.user.emailVerifiedAt ?? 0).getTime();

    if (timePassed < EMAIL_INTERVAL) {
        return res.status(429).json({
            errors: {
                root: `Please wait ${Math.ceil(
                    (EMAIL_INTERVAL - timePassed) / 1000 / 60
                )} minutes before changing your email again`,
            },
        });
    }

    const email = (req.body.email ?? null) as string | null;

    // If email is null, unlink the email from the account

    if (email === null) {
        try {
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: { email: null, isEmailVerified: false },
            });

            res.status(200).json({
                message: 'Successfully unlinked email',
                user: toSafeUser(user),
            });
        } catch (e) {
            return res
                .status(500)
                .json({ errors: { root: 'Internal Server Error' } });
        }
    } else {
        const validation = emailSchema.safeParse(email);

        if (!validation.success) {
            return res.status(400).json({
                errors: {
                    email: validation.error.issues[0].message,
                },
            });
        }

        try {
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: { email, isEmailVerified: false },
            });

            // Show the token for testing purposes
            // In production, this should be sent via email
            const token = await sendVerificationEmail(req.user.id);

            res.json({ user: toSafeUser(user), token });
        } catch (e) {
            return res
                .status(500)
                .json({ errors: { root: 'Internal Server Error' } });
        }
    }
});
