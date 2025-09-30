import express from 'express';
import postsRouter from './posts/index.js';
import authRouter from './auth/index.js';
import settingsRouter from './settings/index.js';
import usersRouter from './users/index.js';

const apiRouter = express.Router();

apiRouter.use('/posts', postsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/users', usersRouter);

export default apiRouter;
