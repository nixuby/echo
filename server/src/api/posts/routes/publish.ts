import prisma from '@/prisma.js';
import { Prisma } from 'generated/prisma/index.js';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import { createNotification } from '@/notifications.js';
import { SAFE_POST_SELECT, toClientPost } from '../util/safe-post.js';
import postsRouter from '../router.js';

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
            throw new Error('Failed to process attachment');
        }
    }
}

postsRouter.post('/publish', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const { content, attachments, parentId } = req.body;

    if (parentId && typeof parentId !== 'string') {
        return res
            .status(400)
            .json({ errors: { root: 'parentId must be a string' } });
    }

    if (!content && (!attachments || attachments.length === 0)) {
        return res
            .status(400)
            .json({ errors: { root: 'Content or attachments are required' } });
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
              select: {
                  id: true,
                  type: true,
                  author: { select: { id: true } },
              },
          })
        : null;

    if (parent && parent.type === 'REPOST') {
        return res
            .status(400)
            .json({ errors: { root: 'Cannot reply to a repost' } });
    }

    const userId = req.user.id;

    try {
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

            const postId = post.id;

            await processAttachments(tx, postId, attachments);

            for (const id of parentIds) {
                await tx.post.update({
                    where: { id },
                    data: { replyCount: { increment: 1 } },
                });
            }

            if (reply && parent && parent.author.id !== userId) {
                await createNotification(
                    parent!.author.id,
                    {
                        type: 'post_replied',
                        data: { postId, userId },
                    },
                    tx
                );
            }

            return [post];
        });

        return res.status(201).json(toClientPost(post));
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return res.status(400).json({ errors: { root: message } });
    }
});
