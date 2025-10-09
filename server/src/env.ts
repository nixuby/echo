import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

function need(envname: string, defaultValue?: string): string {
    const value = process.env[envname] ?? defaultValue;
    if (!value) throw new Error(`Missing environment variable: ${envname}`);
    return value;
}

const ENV = {
    HOST: need('HOST'),
    PORT: Number(need('PORT', '5179')) || 5179,
    PW_HASH_SEED: need('PW_HASH_SEED'),
    SESSION_SECRET: need('SESSION_SECRET'),
    CORS_ORIGIN: need('CORS_ORIGIN'),
    DEV: need('DEV', 'false').toLowerCase() === 'true',
} as const;

export default ENV;
