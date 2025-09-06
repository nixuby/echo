import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

function need(envname: string, defaultValue?: string): string {
    const value = process.env[envname] ?? defaultValue;
    if (!value) throw new Error(`Missing environment variable: ${envname}`);
    return value;
}

const ENV = {
    PW_HASH_SEED: need('PW_HASH_SEED'),
    SESSION_SECRET: need('SESSION_SECRET'),
} as const;

export default ENV;
