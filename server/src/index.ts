import express from 'express';
import cors from 'cors';
import session from 'express-session';
import env from './env.js';
import passport from './auth/passport.js';
import helmet from 'helmet';
import fileStore from 'session-file-store';
import apiRouter from './api/router.js';

console.log('Environment variables:', env);

console.log('Initializing Express');

const FileStore = fileStore(session);

const app = express();

// Middleware
app.use(
    cors({
        origin: env.CORS_ORIGINS,
        credentials: true,
    })
);
app.use(
    express.json({
        limit: '500mb',
    })
);
app.use(
    session({
        name: 'sid',
        secret: env.SESSION_SECRET,
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

if (env.DEV) {
    function formatTimeNs(time: number) {
        if (time < 1_000) {
            return `\x1b[90m${time.toFixed(0)} ns\x1b[0m`;
        } else if (time < 1_000_000) {
            return `\x1b[90m${(time / 1_000).toFixed(0)} us\x1b[0m`;
        } else if (time < 1_000_000_000) {
            return `\x1b[90m${(time / 1_000_000).toFixed(0)} ms\x1b[0m`;
        } else {
            return `\x1b[31m${(time / 1_000_000_000).toFixed(2)} s\x1b[0m`;
        }
    }

    app.use((req, res, next) => {
        const start = performance.now();
        next();
        const dur = formatTimeNs((performance.now() - start) * 1_000_000);
        const time = new Date().toISOString().split('T')[1].substring(0, 8);
        console.log(
            `\x1b[32m${time}\x1b[0m [\x1b[33m${req.ip}\x1b[0m] - \x1b[35m${res.statusCode} \x1b[36m${req.method}\x1b[0m ${req.originalUrl} [${dur}]`
        );
    });
}

console.log('Setting up routes');
app.use('/api', apiRouter);

app.listen(env.PORT, env.HOST, (error) => {
    console.log('Starting server');

    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log(`Server is running on ${env.HOST}, ${env.PORT}`);
    }
});
