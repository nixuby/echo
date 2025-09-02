import express from 'express';
import rootRouter from './routes/router.js';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Router
app.use(rootRouter);

// Listen for requests
app.listen(5179, '127.0.0.1', (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log('Server is running on http://127.0.0.1:5179');
    }
});
