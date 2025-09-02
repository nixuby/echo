import express from 'express';

const apiRouter = express.Router();

apiRouter.get('/posts', (req, res) => {
    res.send('List of posts');
});

export default apiRouter;
