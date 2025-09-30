import LANGUAGES from '@shared/lang.js';
import settingsRouter from '../router.js';
import prisma from '@/prisma.js';

settingsRouter.post('/language', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const language = req.body.language as string | undefined;

    if (!language || LANGUAGES[language] == undefined) {
        return res.status(400).json({
            errors: { root: 'Invalid language' },
        });
    }

    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { language },
        });
        res.status(200).json({ language });
    } catch (e) {
        return res
            .status(500)
            .json({ errors: { root: 'Internal Server Error' } });
    }
});
