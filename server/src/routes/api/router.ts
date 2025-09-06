import express from 'express';
import postsRouter from './posts/router.js';
import authRouter from './auth/router.js';
import settingsRouter from './settings/router.js';

const apiRouter = express.Router();

apiRouter.use(postsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/settings', settingsRouter);

export default apiRouter;
