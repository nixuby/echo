import ENV from '@/env.js';
import { scrypt } from 'node:crypto';

export async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        scrypt(password, ENV.PW_HASH_SEED, 64, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey.toString('hex'));
        });
    });
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    const derivedHash = await hashPassword(password);
    return derivedHash === hash;
}
