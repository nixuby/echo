import authRouter from '../router.js';

authRouter.get('/me', (req, res) => {
    if (!req.user)
        return res.status(401).json({ errors: { root: 'auth.unauthorized' } });
    res.json({ user: req.user });
});
