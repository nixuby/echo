import prisma from '@/prisma.js';
import { Post } from '@shared/types.js';
import express from 'express';
import { Prisma } from 'generated/prisma/index.js';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import { createNotification } from '@/notifications.js';
import { SAFE_POST_SELECT, toClientPost } from '../util/safe-post.js';
import postsRouter from '../router.js';

function parseSort(sort: any): Prisma.PostOrderByWithRelationInput {
    if (sort === 'newest') return { createdAt: 'desc' };
    if (sort === 'oldest') return { createdAt: 'asc' };
    if (sort === 'likes') return { likeCount: 'desc' };
    return { createdAt: 'desc' }; // Default
}

function paginate(page: number) {
    const LIMIT = 10;

    return {
        skip: page * LIMIT,
        take: LIMIT,
    };
}

async function getHomeFeed(req: express.Request): Promise<Array<Post>> {
    const page = Number(req.query.page);
    const sort = parseSort(req.query.sort);

    const posts = await prisma.post.findMany({
        where: {
            type: {
                in: ['ORIGINAL'],
            },
        },
        select: SAFE_POST_SELECT(req.user?.id, false),
        orderBy: sort,
        ...paginate(page),
    });

    return posts.map(toClientPost);
}

async function getProfileFeed(req: express.Request): Promise<Array<Post>> {
    const username = req.query.username as string;
    if (!username) {
        throw new Error('Invalid parameters');
    }

    const page = Number(req.query.page);
    const sort = parseSort(req.query.sort);

    const posts = await prisma.post.findMany({
        where: {
            type: {
                in: ['ORIGINAL', 'REPOST'],
            },
            author: { username },
        },
        select: SAFE_POST_SELECT(req.user?.id, true),
        orderBy: sort,
        ...paginate(page),
    });

    return posts.map(toClientPost);
}

async function getReplyFeed(req: express.Request): Promise<Array<Post>> {
    const parentId = req.query.parentId as string;
    if (!parentId) {
        throw new Error('Invalid parameters');
    }

    const page = Number(req.query.page);
    const sort = parseSort(req.query.sort);

    const posts = await prisma.post.findMany({
        where: { type: 'REPLY', parentId },
        select: SAFE_POST_SELECT(req.user?.id, true),
        orderBy: sort,
        ...paginate(page),
    });

    return posts.map(toClientPost);
}

postsRouter.get('/feed', async (req, res) => {
    const fetchFn = (() => {
        switch (req.query.type) {
            case 'profile':
                return getProfileFeed;
            case 'reply':
                return getReplyFeed;
            default:
                return getHomeFeed;
        }
    })();

    const posts = await fetchFn(req);
    return res.json(posts);
});

postsRouter.get('/:id', async (req, res) => {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: SAFE_POST_SELECT(req.user?.id, true),
    });

    if (!post) {
        return res.status(404).json({ errors: { root: 'Not found' } });
    }

    return res.json(toClientPost(post));
});
