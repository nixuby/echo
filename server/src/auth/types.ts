import { type User as TUser } from '@shared/types.js';

declare global {
    namespace Express {
        interface User extends TUser {}
    }
}

// Safe user
export type User = TUser;

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
