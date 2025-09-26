import { ClientUser, type ServerUser } from '@shared/types.js';

declare global {
    namespace Express {
        interface User extends ServerUser {}
    }
}

// Safe user
export type User = ClientUser;

export function toSafeUser(user: any): User {
    return {
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
        bio: user.bio,
        language: user.language,
        isVerified: user.isVerified,
        notificationCount: user.notificationCount ?? 0,
        createdAt: user.createdAt.toISOString(),
    };
}
