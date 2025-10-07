// Send verification "email"

import prisma from '@/prisma.js';
import generateVerificationToken from '@/util/generate-verification-token.js';

export default async function sendVerificationEmail(userId: string) {
    const token = generateVerificationToken();
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
