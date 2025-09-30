import prisma from '@/prisma.js';
import postsRouter from '../router.js';
import { createNotification } from '@/notifications.js';

postsRouter.post('/:id/like', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const postId = req.params.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
            id: true,
            type: true,
            author: {
                select: {
                    id: true,
                    username: true,
                },
            },
            likes: {
                where: { userId: req.user.id },
                select: { id: true },
            },
        },
    });

    if (!post) {
        return res.status(404).json({ errors: { root: 'Not found' } });
    }

    if (post.type === 'REPOST') {
        return res
            .status(400)
            .json({ errors: { root: 'Cannot like a repost' } });
    }

    let likeCount = 0;
    let likedByMe = post.likes.length > 0;

    if (likedByMe) {
        // Unlike
        likeCount = (
            await prisma.$transaction([
                prisma.postLike.delete({ where: { id: post.likes[0].id } }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likeCount: { decrement: 1 } },
                }),
            ])
        )[1].likeCount;
        likedByMe = false;
    } else {
        // Like
        likeCount = (
            await prisma.$transaction([
                prisma.postLike.create({
                    data: { postId, userId: req.user.id },
                }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likeCount: { increment: 1 } },
                }),
            ])
        )[1].likeCount;
        likedByMe = true;

        // Create notification for the post author
        if (post.author.id !== req.user.id) {
            await createNotification(post.author.id, {
                type: 'post_liked',
                data: { postId, userId: req.user.id },
            });
        }
    }

    return res.status(200).json({ likeCount, likedByMe });
});
