import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const host = env.VITE_DEV_SERVER_HOST;
    const port = Number(env.VITE_DEV_SERVER_PORT);

    const dirname = path.resolve();

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: [
                { find: '@', replacement: path.resolve(dirname, 'src') },
                {
                    find: '@shared',
                    replacement: path.resolve(dirname, '../shared/src'),
                },
            ],
        },
        server: {
            host,
            port,
            fs: {
                allow: ['..'],
            },
        },
        optimizeDeps: {
            include: [],
        },
        build: {
            commonjsOptions: {
                include: [/shared/, /node_modules/],
            },
        },
    };
});
