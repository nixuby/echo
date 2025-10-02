import prisma from '@/prisma.js';
import usersRouter from '../router.js';
import { toSafeUser } from '@/auth/types.js';
import { SAFE_POST_SELECT } from '@/api/posts/util/safe-post.js';

usersRouter.get('/search', async (req, res) => {
    const query = req.query.q;

    // Comma-delimited list of types to search for
    // Types: "users", "posts"
    const type = (req.query.type as string) || 'users';
    const types = type.split(',');

    const limit = parseInt((req.query.limit as string) || '10', 10);

    if (!query || typeof query !== 'string' || query.length < 3) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const result: Record<string, any> = {};

    for (const t of types) {
        if (t === 'users') {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: query } },
                        { name: { contains: query } },
                    ],
                },
                take: limit,
            });
            result.users = users.map(toSafeUser);
        } else if (t === 'posts') {
            const posts = await prisma.post.findMany({
                where: {
                    type: 'ORIGINAL',
                    content: { contains: query },
                },
                select: SAFE_POST_SELECT(
                    req.user ? req.user.id : undefined,
                    true
                ),
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            result.posts = posts;
        }
    }

    return res.json(result);
});
