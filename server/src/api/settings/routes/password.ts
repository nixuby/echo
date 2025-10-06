import { changePasswordFormSchema } from '@shared/validation.js';
import settingsRouter from '../router.js';
import prisma from '@/prisma.js';
import { hashPassword } from '@/auth/hash-password.js';

settingsRouter.post('/password', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const { current, new: newPassword, confirm } = req.body;

    const validation = changePasswordFormSchema.safeParse({
        current,
        new: newPassword,
        confirm,
    });

    if (!validation.success) {
        return res.status(400).json({
            errors: {
                root: 'validation-failed',
                // Other validation errors are handled on the client
            },
        });
    }

    try {
        const hash = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hash },
        });

        return res.status(204).end();
    } catch {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});
