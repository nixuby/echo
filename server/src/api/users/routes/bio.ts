import prisma from '@/prisma.js';
import usersRouter from '../router.js';

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
