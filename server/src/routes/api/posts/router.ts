import prisma from '@/prisma.js';
import express from 'express';

const postsRouter = express.Router();

const SAFE_POST_SELECT = {
    id: true,
    author: {
        select: {
            name: true,
            username: true,
        },
    },
    content: true,
    createdAt: true,
    updatedAt: true,
};

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
        select: SAFE_POST_SELECT,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return res.json(posts);
});

postsRouter.get('/:id', async (req, res) => {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: SAFE_POST_SELECT,
    });

    if (!post) {
        return res.status(404).json({ errors: { root: 'Not found' } });
    }

    return res.json(post);
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
        select: SAFE_POST_SELECT,
    });

    return res.status(201).json(post);
});

export default postsRouter;
