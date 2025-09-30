import prisma from '@/prisma.js';
import { SAFE_POST_SELECT, toClientPost } from '../util/safe-post.js';
import { createNotification } from '@/notifications.js';
import postsRouter from '../router.js';

postsRouter.post('/:id/repost', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const originalId = req.params.id;

    const originalPost = await prisma.post.findUnique({
        where: { id: originalId },
        select: {
            id: true,
            type: true,
            author: {
                select: {
                    id: true,
                },
            },
            _count: {
                select: {
                    children: {
                        where: { AND: { type: 'REPOST', userId: req.user.id } },
                    },
                },
            },
        },
    });

    if (!originalPost) {
        return res.status(404).json({ errors: { root: 'Not found' } });
    }

    if (originalPost.type === 'REPOST') {
        return res
            .status(400)
            .json({ errors: { root: 'Cannot repost a repost' } });
    }

    const repostedByMe = originalPost._count.children > 0;

    if (repostedByMe) {
        // Delete the repost
        await prisma.$transaction([
            prisma.post.deleteMany({
                where: {
                    AND: {
                        type: 'REPOST',
                        userId: req.user.id,
                        parentId: originalId,
                    },
                },
            }),
            prisma.post.update({
                where: {
                    id: originalId,
                },
                data: {
                    repostCount: { decrement: 1 },
                },
            }),
        ]);

        return res.status(204);
    } else {
        // Create the repost
        const post = await prisma.$transaction(async (tx) => {
            const post = await tx.post.create({
                data: {
                    type: 'REPOST',
                    author: { connect: { id: req.user!.id } },
                    content: '<repost>',
                    parent: { connect: { id: originalId } },
                },
                select: SAFE_POST_SELECT(req.user?.id, true),
            });

            await tx.post.update({
                where: {
                    id: originalId,
                },
                data: {
                    repostCount: { increment: 1 },
                },
            });

            if (originalPost.author.id !== req.user!.id) {
                await createNotification(
                    originalPost.author.id,
                    {
                        type: 'post_shared',
                        data: { postId: originalId, userId: req.user!.id },
                    },
                    tx
                );
            }

            return post;
        });

        return res.status(201).json(toClientPost(post));
    }
});
