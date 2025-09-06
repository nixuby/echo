import prisma from '@/prisma.js';
import passport from 'passport';
import { localStrategy } from './local.js';

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return done(null, false);
        return done(null, {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
        });
    } catch (e) {
        done(e as Error);
    }
});

passport.use(localStrategy);

export default passport;
