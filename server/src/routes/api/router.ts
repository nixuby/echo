import express from 'express';
import postsRouter from './posts/router.js';

const apiRouter = express.Router();

apiRouter.use(postsRouter);

export default apiRouter;
