import express from 'express';
import rootRouter from './routes/router.js';
import cors from 'cors';
import session from 'express-session';
import ENV from './env.js';
import passport from './auth/passport.js';
import helmet from 'helmet';
import fileStore from 'session-file-store';

const FileStore = fileStore(session);

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(
    express.json({
        limit: '500mb',
    })
);
app.use(
    session({
        name: 'sid',
        secret: ENV.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // TODO: Set to true in production
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
        store: new FileStore({ path: './generated/sessions' }),
    })
);

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

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
