import express from 'express';
import { Post } from '@shared/types.js';
import { jsonReplaceDates } from '@shared/json-date.js';

const apiRouter = express.Router();

apiRouter.get('/posts', (req, res) => {
    const result: Array<Post> = [
        {
            id: '81a24714-5969-43c8-a2fa-08be7d713e3d',
            author: {
                id: '19bd4a35-5e8f-493d-843a-de9968862114',
                name: 'John Doe',
                username: 'john_doe',
            },
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            stats: { likes: 10, comments: 5, reposts: 2 },
            createdAt: new Date('9/2/25 2:00 pm'),
        },

        {
            id: 'f8c86d22-8d93-4923-9db3-e413a55083ed',
            author: {
                id: 'ccf966c2-dd1f-4f1f-94e4-380652c1afc9',
                name: 'Jane Doe',
                username: 'jane_doe',
            },
            content:
                'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            stats: { likes: 20, comments: 10, reposts: 5 },
            createdAt: new Date('8/15/25 1:30 pm'),
        },
    ];

    jsonReplaceDates(result);

    res.json(result);
});

export default apiRouter;
