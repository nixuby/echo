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
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user || !user.password) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            const hashOk = await verifyPassword(password, user.password);
            if (!hashOk) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            return done(null, {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
            });
        } catch (e) {
            return done(e as Error, false, { message: 'server_error' });
        }
    }
);
