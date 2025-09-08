export type User = {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: string | null; // Date string
};

export type Post = {
    id: string;
    author: {
        name: string;
        username: string;
    };
    content: string;
    createdAt: string;
    updatedAt: string;
};

export type PostStats = {
    likes: number;
    comments: number;
    reposts: number;
};
