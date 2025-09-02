import express from 'express';
import apiRouter from './api/router.js';

const rootRouter = express.Router();

rootRouter.use('/api', apiRouter);

export default rootRouter;
