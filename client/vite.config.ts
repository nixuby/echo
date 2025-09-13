import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import process from 'node:process';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    const host = env.VITE_DEV_SERVER_HOST;
    const port = env.VITE_DEV_SERVER_PORT;

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@shared': path.resolve(__dirname, '../shared'),
            },
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
