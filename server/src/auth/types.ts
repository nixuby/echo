declare global {
    namespace Express {
        interface User {
            id: string;
            email: string | null;
            isEmailVerified: boolean;
            name: string | null;
            username: string;
        }
    }
}

// Safe user
export type User = Express.User;

export function toSafeUser(user: any): User {
    return {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        name: user.name,
        username: user.username,
    };
}
