import passportLocal from 'passport-local';
import prisma from '@/prisma.js';
import { verifyPassword } from './hash-password.js';

export const localStrategy = new passportLocal.Strategy(
    {
        usernameField: 'username',
        passwordField: 'password',
    },
    async (username, password, done) => {
        try {
            if (!username || !password) {
                return done(null, false, {
                    message: 'auth.missing-credentials',
                });
            }

            const user = await prisma.user.findUnique({
                where: { username },
                include: {
                    _count: {
                        select: { notifications: { where: { isRead: false } } },
                    },
                },
            });
            if (!user || !user.password) {
                return done(null, false, {
                    message: 'auth.invalid-credentials',
                });
            }
            const hashOk = await verifyPassword(password, user.password);
            if (!hashOk) {
                return done(null, false, {
                    message: 'auth.invalid-credentials',
                });
            }
            return done(null, {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                isEmailVerified: user.isEmailVerified,
                emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
                bio: user.bio,
                language: user.language,
                isVerified: user.isVerified,
                createdAt: user.createdAt.toISOString(),
                notificationCount: user._count.notifications,
            });
        } catch (e) {
            return done(e as Error, false, { message: 'Server error' });
        }
    }
);
