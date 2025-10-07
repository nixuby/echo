import prisma from '@/prisma.js';
import settingsRouter from '../router.js';
import { toSafeUser } from '@/auth/types.js';

settingsRouter.post('/email/verify', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const token = req.body.token as string | undefined;

    if (!token) {
        return res.status(400).json({ errors: { token: 'Token is required' } });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ errors: { root: 'User not found' } });
        }

        const verificationRecord = await prisma.verificationEmail.findFirst({
            where: {
                userId: user.id,
                token,
            },
        });

        if (
            !verificationRecord ||
            verificationRecord.expiresAt < new Date() ||
            verificationRecord.deletedAt ||
            verificationRecord.type !== 'verify_email'
        ) {
            return res.status(400).json({ errors: { root: 'Invalid token' } });
        }

        // Update the user's email verification status

        const newUser = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.update({
                where: { id: user.id },
                data: { isEmailVerified: true },
            });

            await tx.verificationEmail.update({
                where: { userId: user.id, token },
                data: { deletedAt: new Date() },
            });

            return newUser;
        });

        res.status(200).json({ user: toSafeUser(newUser) });
    } catch (e) {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});
