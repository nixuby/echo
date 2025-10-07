import { emailSchema, passwordSchema } from '@shared/validation.js';
import authRouter from '../router.js';
import prisma from '@/prisma.js';
import generateVerificationToken from '@/util/generate-verification-token.js';
import { hashPassword } from '@/auth/hash-password.js';

authRouter.post('/reset-password', async (req, res) => {
    if (req.user) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const token = req.body.token as string | undefined;
    const password = req.body.password as string | undefined;
    const confirm = req.body.confirm as string | undefined;

    if (!token || !password || !confirm) {
        return res.status(400).json({ errors: { root: 'validation-failed' } });
    }

    if (password !== confirm) {
        return res
            .status(400)
            .json({ errors: { confirm: 'password.mismatch' } });
    }

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
        return res.status(400).json({ errors: { root: 'validation-failed' } });
    }

    const verificationRecord = await prisma.verificationEmail.findUnique({
        where: {
            token,
        },
    });

    if (
        !verificationRecord ||
        verificationRecord.expiresAt < new Date() ||
        verificationRecord.deletedAt ||
        verificationRecord.type !== 'reset_password'
    ) {
        return res.status(400).json({ errors: { root: 'Invalid token' } });
    }

    const hash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: verificationRecord.userId },
            data: { password: hash },
        });

        await tx.verificationEmail.update({
            where: { token },
            data: { deletedAt: new Date() },
        });
    });

    return res.status(204).end();
});

authRouter.post('/request-password-reset', async (req, res) => {
    if (req.user) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const email = req.body.email;

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
        return res.status(400).json({ errors: { root: 'validation-failed' } });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        // Send success response even if user not found to prevent email enumeration
        return res.status(200).json({
            token: 'not-found', // For testing purposes, remove in real production environment
        });
    }

    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    try {
        await prisma.verificationEmail.create({
            data: {
                token,
                type: 'reset_password',
                userId: user.id,
                expiresAt,
            },
        });

        return res.status(200).json({
            token, // For testing purposes, remove in real production environment
        });
    } catch {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});
