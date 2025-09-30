import authRouter from '../router.js';

authRouter.post('/sign-out', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json(null);
    });
});
