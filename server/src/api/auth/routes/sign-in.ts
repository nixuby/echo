import authRouter from '../router.js';
import passport from '@/auth/passport.js';

authRouter.post('/sign-in', (req, res, next) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({
            errors: { root: 'auth.missing-credentials' },
        });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({
                errors: {
                    root: info?.message || 'auth.invalid-credentials',
                },
            });
        }

        req.login(user, (err2) => {
            if (err2) return next(err2);
            res.json({ user });
        });
    })(req, res, next);
});
