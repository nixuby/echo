import prisma from '@/prisma.js';
import { Post } from '@shared/types.js';
import express from 'express';
import { Prisma } from 'generated/prisma/index.js';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs/promises';

const postsRouter = express.Router();

const SAFE_POST_SELECT = (userId?: string, withParent?: boolean): any => ({
    id: true,
    type: true,
    author: {
        select: {
            name: true,
            username: true,
            isVerified: true,
        },
    },
    content: true,
    likeCount: true,
    replyCount: true,
    repostCount: true,
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
    attachments: {
        select: {
            id: true,
            type: true,
        },
    },
    _count: userId
        ? {
              select: {
                  children: {
                      where: { type: 'REPOST', userId },
                  },
              },
          }
        : false,
});

function toClientPost(post: any): Post {
    return {
        id: post.id,
        type: post.type,
        author: post.author,
        content: post.content,
        likeCount: post.likeCount,
        likedByMe: post.likes?.length > 0,
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        repostedByMe: post._count?.children > 0,
        parentId: post.parentId,
        parent: post.parent ? toClientPost(post.parent) : null,
        attachments: post.attachments,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
}

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

async function processAttachments(
    tx: Prisma.TransactionClient,
    postId: string,
    attachments: Array<string>
): Promise<void> {
    const SUPPORTED_TYPES = [
        'image',
        // TODO
        //  'video'
    ];
    const files: Array<[type: string, data: Buffer]> = [];

    // Parse, collect, and validate
    for (const file of attachments) {
        const type = file.split(';')[0].split(':')[1]; // Extract MIME type from data URL
        const data = file.split(',')[1]; // Extract base64 data
        const buffer = Buffer.from(data, 'base64');
        files.push([type, buffer]);
        // Validate
        let supported = false;
        for (const supportedType of SUPPORTED_TYPES) {
            if (type.startsWith(supportedType + '/')) {
                supported = true;
                break;
            }
        }
        if (!supported) throw new Error('Unsupported attachment type');
    }

    // Process images with sharp and videos with ffmpeg
    for (const file of files) {
        const [type, data] = file;
        try {
            if (type.startsWith('image/')) {
                // Process image with sharp
                const buffer = await sharp(data)
                    .resize({
                        height: 1280,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .toFormat('jpeg')
                    .toBuffer();

                const attachment = await tx.postAttachment.create({
                    data: {
                        postId,
                        type: 'image/jpeg',
                    },
                });

                await fs.writeFile(`./uploads/${attachment.id}`, buffer);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                throw new Error('Failed to process attachment: ' + e.message);
            } else throw new Error('Failed to process attachment');
        }
    }
}

postsRouter.post('/publish', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const { content, attachments, parentId } = req.body;

    if (parentId && typeof parentId !== 'string') {
        return res
            .status(400)
            .json({ errors: { root: 'parentId must be a string' } });
    }

    if (!content) {
        return res
            .status(400)
            .json({ errors: { root: 'Content is required' } });
    }

    if (!attachments || !Array.isArray(attachments)) {
        return res
            .status(400)
            .json({ errors: { root: 'Attachments must be an array' } });
    }

    const parentIds = parentId ? await getAncestorIds(parentId) : [];

    const reply = parentId != null;

    const parent = parentId
        ? await prisma.post.findUnique({
              where: {
                  id: parentId,
              },
              select: { id: true, type: true },
          })
        : null;

    if (parent && parent.type === 'REPOST') {
        return res
            .status(400)
            .json({ errors: { root: 'Cannot reply to a repost' } });
    }

    const userId = req.user.id;

    const [post] = await prisma.$transaction(async (tx) => {
        const post = await tx.post.create({
            data: {
                type: reply ? 'REPLY' : 'ORIGINAL',
                author: { connect: { id: userId } },
                content,
                parent: {
                    connect: parentId ? { id: parentId } : undefined,
                },
            },
            select: SAFE_POST_SELECT(userId, false),
        });

        const postId = post.id as unknown as string;

        await processAttachments(tx, postId, attachments);

        for (const id of parentIds) {
            await tx.post.update({
                where: { id },
                data: { replyCount: { increment: 1 } },
            });
        }
        return [post];
    });

    return res.status(201).json(toClientPost(post));
});

postsRouter.get('/attachment/:id', async (req, res) => {
    const attachmentId = req.params.id;
    const attachment = await prisma.postAttachment.findUnique({
        where: { id: attachmentId },
    });
    if (!attachment) {
        return res.status(404).json({ errors: { root: 'Not found' } });
    }
    const file = await fs.readFile(`./uploads/${attachment.id}`);
    res.setHeader('Content-Type', attachment.type);
    return res.send(file);
});

postsRouter.post('/:id/repost', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const originalId = req.params.id;

    const originalPost = await prisma.post.findUnique({
        where: { id: originalId },
        select: {
            id: true,
            type: true,
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
        const post = (
            await prisma.$transaction([
                prisma.post.create({
                    data: {
                        type: 'REPOST',
                        author: { connect: { id: req.user.id } },
                        content: '<repost>',
                        parent: { connect: { id: originalId } },
                    },
                    select: SAFE_POST_SELECT(req.user?.id, true),
                }),
                prisma.post.update({
                    where: {
                        id: originalId,
                    },
                    data: {
                        repostCount: { increment: 1 },
                    },
                }),
            ])
        )[0];

        return res.status(201).json(toClientPost(post));
    }
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
            type: true,
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
    }

    return res.status(200).json({ likeCount, likedByMe });
});

export default postsRouter;
