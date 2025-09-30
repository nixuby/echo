import prisma from '@/prisma.js';
import usersRouter from '../router.js';
import { createNotification } from '@/notifications.js';

usersRouter.post('/follow/:username', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    }

    const usernameToFollow = req.params.username;

    if (!usernameToFollow || typeof usernameToFollow !== 'string') {
        return res.status(400).json({ errors: { root: 'Invalid request' } });
    }

    if (usernameToFollow === req.user.username) {
        return res
            .status(400)
            .json({ errors: { root: 'You cannot follow yourself' } });
    }

    const isFollowed = await prisma.$transaction(async (tx) => {
        const userToFollow = await tx.user.findUnique({
            where: { username: usernameToFollow },
            select: { id: true },
        });

        if (!userToFollow) {
            res.status(404).json({ errors: { root: 'User not found' } });
            return;
        }

        const alreadyFollowing = await tx.userFollow.findUnique({
            where: {
                followerId_followsId: {
                    followerId: req.user!.id,
                    followsId: userToFollow.id,
                },
            },
        });

        if (alreadyFollowing) {
            await tx.userFollow.delete({
                where: {
                    followerId_followsId: {
                        followerId: req.user!.id,
                        followsId: userToFollow.id,
                    },
                },
            });
            return false;
        } else {
            await tx.userFollow.create({
                data: {
                    followerId: req.user!.id,
                    followsId: userToFollow.id,
                },
            });

            await createNotification(
                userToFollow.id,
                {
                    type: 'new_follower',
                    data: { userId: req.user!.id },
                },
                tx
            );

            return true;
        }
    });

    return res.status(200).json(isFollowed);
});
