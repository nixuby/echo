import prisma from '@/prisma.js';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { OtherClientUser } from '@shared/types.js';

const usersRouter = express.Router();

const __dirname = path.resolve();

usersRouter.get('/pic/:username', async (req, res) => {
    const DEFAULT_PATH = path.join(__dirname, 'res', 'default-pfp.jpg');
    const { username } = req.params;
    const picturePath = path.join(
        __dirname,
        'uploads',
        'pictures',
        `${username}.jpg`
    );

    res.sendFile(existsSync(picturePath) ? picturePath : DEFAULT_PATH, {
        headers: { 'Content-Type': 'image/jpeg' },
    });
});

usersRouter.post('/pic', async (req, res) => {
    const UPLOAD_DIRECTORY_PATH = path.join(__dirname, 'uploads', 'pictures');
    const IMAGE_SIZE_SMALL = 128;
    const IMAGE_SIZE_LARGE = 512;

    if (!existsSync(UPLOAD_DIRECTORY_PATH)) {
        await fs.mkdir(UPLOAD_DIRECTORY_PATH, { recursive: true });
    }

    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    // File as Base64
    const fileBase64 = req.body.picture;

    if (!fileBase64) {
        return res
            .status(400)
            .json({ errors: { root: 'No picture provided' } });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    // Output paths

    const fullOutputPath = path.join(
        UPLOAD_DIRECTORY_PATH,
        `${req.user.username}.jpg`
    );
    const previewOutputPath = path.join(
        UPLOAD_DIRECTORY_PATH,
        `${req.user.username}-sm.jpg`
    );

    // Create the images

    try {
        const fullPicture = sharp(buffer);
        const previewPicture = fullPicture.clone();

        // Resize the pictures

        fullPicture.resize({
            width: IMAGE_SIZE_LARGE,
            height: IMAGE_SIZE_LARGE,
            fit: sharp.fit.cover,
        });

        previewPicture.resize({
            width: IMAGE_SIZE_SMALL,
            height: IMAGE_SIZE_SMALL,
            fit: sharp.fit.cover,
        });

        // Save the pictures

        await Promise.all([
            fullPicture.toFile(fullOutputPath),
            previewPicture.toFile(previewOutputPath),
        ]);

        return res.status(204).end();
    } catch (error) {
        return res
            .status(500)
            .json({ errors: { root: 'Failed to save picture' } });
    }
});

usersRouter.post('/bio', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'Unauthorized' } });
    }

    const bio = req.body.bio;

    if (typeof bio !== 'string' || bio.length > 160) {
        return res.status(400).json({
            errors: { root: 'Bio must be a string up to 160 characters' },
        });
    }

    await prisma.user.update({
        where: { id: req.user.id },
        data: { bio },
    });

    return res.status(204).end();
});

usersRouter.get('/:splat', async (req, res) => {
    const splat = req.params.splat;

    if (splat.length === 0) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    if (splat[0] === '@') {
        const username = splat.slice(1);

        const prUser = await prisma.user.findUnique({
            where: { username },
            select: {
                username: true,
                name: true,
                bio: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
        });

        if (!prUser) {
            return res.status(404).json({ errors: { root: 'User not found' } });
        }

        return res.json({
            username: prUser.username,
            name: prUser.name,
            bio: prUser.bio,
            isVerified: prUser.isVerified,
            createdAt: prUser.createdAt.toISOString(),
            postCount: prUser._count.posts,
        } satisfies OtherClientUser);
    }

    res.status(400).json({ errors: { root: 'Invalid request' } });
});

export default usersRouter;
