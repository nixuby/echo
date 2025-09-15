import prisma from '@/prisma.js';
import { Post } from '@shared/types.js';
import express from 'express';
import { Prisma } from 'generated/prisma/index.js';

const postsRouter = express.Router();

const SAFE_POST_SELECT = (userId?: string, withParent?: boolean): any => ({
    id: true,
    author: {
        select: {
            name: true,
            username: true,
        },
    },
    content: true,
    likeCount: true,
    replyCount: true,
    createdAt: true,
    updatedAt: true,
    likes: userId
        ? {
              where: { userId: userId },
              select: { id: true },
          }
        : false,
    parentId: withParent,
    parent: withParent
        ? {
              select: SAFE_POST_SELECT(userId, false),
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
        replyCount: post.replyCount,
        parentId: post.parentId,
        parent: post.parent,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
}

postsRouter.get('/feed', async (req, res) => {
    function parseSort(sort: any): Prisma.PostOrderByWithRelationInput {
        if (sort === 'newest') return { createdAt: 'desc' };
        if (sort === 'oldest') return { createdAt: 'asc' };
        if (sort === 'likes') return { likeCount: 'desc' };
        return { createdAt: 'desc' }; // Default
    }

    const LIMIT = 10;

    const page = Number(req.query.page) || 1;
    const sort = parseSort(req.query.sort);

    if (req.query.username && req.query.parentPostId) {
        return res.status(400).json({ errors: { root: 'Invalid parameters' } });
    }

    const posts = await prisma.post.findMany({
        where: {
            author: {
                username:
                    typeof req.query.username === 'string'
                        ? req.query.username
                        : undefined,
            },
            parentId:
                typeof req.query.parentPostId === 'string'
                    ? req.query.parentPostId
                    : null, // Only fetch top-level posts
        },
        skip: (page - 1) * LIMIT,
        take: LIMIT,
        select: SAFE_POST_SELECT(req.user?.id, false),
        orderBy: sort,
    });

    return res.json(posts.map(toClientPost));
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

async function getAncestorIds(postId: string): Promise<string[]> {
    const ids: string[] = [postId];
    let currentId: string | null = postId;

    while (currentId) {
        const post: { parentId: string | null } | null =
            await prisma.post.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            });
        if (!post) break;
        currentId = post.parentId;
        if (currentId) ids.push(currentId);
    }

    return ids;
}

postsRouter.post('/publish', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const { content, parentId } = req.body;

    if (!content) {
        return res
            .status(400)
            .json({ errors: { root: 'Content is required' } });
    }

    const parentIds = parentId ? await getAncestorIds(parentId) : [];

    const post = (
        await prisma.$transaction([
            prisma.post.create({
                data: {
                    author: { connect: { id: req.user.id } },
                    content,
                    parent: {
                        connect: parentId ? { id: parentId } : undefined,
                    },
                },
                select: SAFE_POST_SELECT(req.user?.id, false),
            }),
            ...parentIds.map((id) =>
                prisma.post.update({
                    where: { id },
                    data: { replyCount: { increment: 1 } },
                })
            ),
        ])
    )[0];

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
