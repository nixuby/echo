import prisma from '@/prisma.js';
import { Post } from '@shared/types.js';
import express from 'express';

const postsRouter = express.Router();

const SAFE_POST_SELECT = (userId?: string) => ({
    id: true,
    author: {
        select: {
            name: true,
            username: true,
        },
    },
    content: true,
    likeCount: true,
    createdAt: true,
    updatedAt: true,
    likes: userId
        ? {
              where: { userId: userId },
              select: { id: true },
          }
        : false,
});

function toClientPost(post: any): Post {
    return {
        id: post.id,
        author: post.author,
        content: post.content,
        likeCount: post.likeCount,
        likedByMe: post.likes ? post.likes.length > 0 : false,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
}

postsRouter.get('/feed', async (req, res) => {
    const LIMIT = 10;

    const page = Number(req.query.page) || 1;

    const posts = await prisma.post.findMany({
        where: {
            author: {
                username:
                    typeof req.query.username === 'string'
                        ? req.query.username
                        : undefined,
            },
        },
        skip: (page - 1) * LIMIT,
        take: LIMIT,
        select: SAFE_POST_SELECT(req.user?.id),
        orderBy: {
            createdAt: 'desc',
        },
    });

    return res.json(posts.map(toClientPost));
});

postsRouter.get('/:id', async (req, res) => {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: SAFE_POST_SELECT(req.user?.id),
    });

    if (!post) {
        return res.status(404).json({ errors: { root: 'Not found' } });
    }

    return res.json(toClientPost(post));
});

postsRouter.post('/publish', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const { content } = req.body;

    if (!content) {
        return res
            .status(400)
            .json({ errors: { root: 'Content is required' } });
    }

    const post = await prisma.post.create({
        data: {
            author: { connect: { id: req.user.id } },
            content,
        },
        select: SAFE_POST_SELECT(req.user?.id),
    });

    return res.status(201).json(toClientPost(post));
});

postsRouter.post('/:id/like', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const postId = req.params.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
            id: true,
            likes: {
                where: { userId: req.user.id },
                select: { id: true },
            },
        },
    });

    if (!post) {
        return res.status(404).json({ errors: { root: 'Not found' } });
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
    }

    return res.status(200).json({ likeCount, likedByMe });
});

export default postsRouter;
