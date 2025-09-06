import express from 'express';
import postsRouter from './posts/router.js';
import authRouter from './auth/router.js';

const apiRouter = express.Router();

apiRouter.use(postsRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
