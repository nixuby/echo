import { type ServerUser } from '@shared/types.js';

declare global {
    namespace Express {
        interface User extends ServerUser {}
    }
}

// Safe user
export type User = ServerUser;

export function toSafeUser(user: any): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt:
            user.emailVerifiedAt == null
                ? null
                : typeof user.emailVerifiedAt === 'string'
                ? user.emailVerifiedAt
                : user.emailVerifiedAt.toISOString(),
    };
}
