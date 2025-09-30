// Send verification "email"

import prisma from '@/prisma.js';

function generateToken(): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export default async function sendVerificationEmail(userId: string) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    await prisma.verificationEmail.create({
        data: {
            userId,
            type: 'verify_email',
            token,
            expiresAt,
        },
    });

    // <SEND EMAIL>

    return token;
}
