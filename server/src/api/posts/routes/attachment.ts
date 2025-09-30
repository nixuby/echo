import prisma from '@/prisma.js';
import postsRouter from '../router.js';
import fs from 'node:fs/promises';

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
