import prisma from '@/prisma.js';
import passport from 'passport';
import { localStrategy } from './local.js';

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { notifications: { where: { isRead: false } } },
                },
            },
        });
        if (!user) return done(null, false);
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
        done(e as Error);
    }
});

passport.use(localStrategy);

export default passport;
