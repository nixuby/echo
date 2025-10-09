import prisma from '@/prisma.js';
import postsRouter from '../router.js';

postsRouter.post('/save', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const postId = req.body.postId;
    if (typeof postId !== 'string') {
        return res.status(400).json({ errors: { root: 'invalid' } });
    }

    const saved = await prisma.$transaction(async (tx) => {
        try {
            // Post does not exist
            if (
                (await tx.post.findUnique({ where: { id: postId } })) === null
            ) {
                res.status(404).json({ errors: { root: 'invalid' } });
                return false;
            }

            // Already saved, unsave
            if (
                await tx.savedPost.findFirst({
                    where: { postId, userId: req.user!.id },
                })
            ) {
                await tx.savedPost.deleteMany({
                    where: { postId, userId: req.user!.id },
                });
                return false;
            } else {
                await tx.savedPost.create({
                    data: { postId, userId: req.user!.id },
                });
                return true;
            }
        } catch {
            res.status(500).json({ errors: { root: 'internal' } });
            return false;
        }
    });

    res.json({ saved });
});
