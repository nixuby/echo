import express from 'express';
import postsRouter from './posts/router.js';
import authRouter from './auth/router.js';
import settingsRouter from './settings/router.js';
import usersRouter from './users/router.js';

const apiRouter = express.Router();

apiRouter.use('/posts', postsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/users', usersRouter);

export default apiRouter;
