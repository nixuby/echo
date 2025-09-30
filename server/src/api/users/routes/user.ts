import prisma from '@/prisma.js';
import usersRouter from '../router.js';
import { OtherClientUser } from '@shared/types.js';

usersRouter.get('/user/:username', async (req, res) => {
    const username = req.params.username;

    if (username.length === 0) {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    const [prUser, followedByMe] = (await prisma.$transaction(async (tx) => {
        const prUser = await tx.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                language: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: {
                            where: { type: 'ORIGINAL' },
                        },
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        const followedByMe =
            req.user && prUser
                ? await tx.userFollow.findUnique({
                      where: {
                          followerId_followsId: {
                              followerId: req.user.id,
                              followsId: prUser.id,
                          },
                      },
                  })
                : false;

        return [prUser, Boolean(followedByMe)];
    })) as [
        {
            id: string;
            username: string;
            name: string | null;
            bio: string;
            language: string;
            createdAt: Date;
            isVerified: boolean;
            _count: {
                posts: number;
                following: number;
                followers: number;
            };
        } | null,
        boolean
    ];

    if (!prUser) {
        return res.status(404).json({ errors: { root: 'User not found' } });
    }

    return res.json({
        username: prUser.username,
        name: prUser.name,
        bio: prUser.bio,
        language: prUser.language,
        isVerified: prUser.isVerified,
        createdAt: prUser.createdAt.toISOString(),
        followerCount: prUser._count.followers,
        followingCount: prUser._count.following,
        postCount: prUser._count.posts,
        followedByMe: followedByMe,
    } satisfies OtherClientUser);
});
