type PrismaSelect<T> = {
    [K in keyof T]: true;
};

export type ClientUser = {
    username: string;
    name: string | null;
    email: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: string | null;
};

export type OtherClientUser = {
    username: string;
    name: string | null;
};

export type ServerUser = {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: string | null; // Date string
};

//

export const CLIENT_USER_SELECT: PrismaSelect<ClientUser> = {
    username: true,
    name: true,
    email: true,
    isEmailVerified: true,
    emailVerifiedAt: true,
};

export const OTHER_CLIENT_USER_SELECT: PrismaSelect<OtherClientUser> = {
    username: true,
    name: true,
};

export const SERVER_USER_SELECT: PrismaSelect<ServerUser> = {
    id: true,
    username: true,
    name: true,
    email: true,
    isEmailVerified: true,
    emailVerifiedAt: true,
};

//

export type PostType = 'ORIGINAL' | 'REPLY' | 'REPOST';

export type Post = {
    id: string;
    type: PostType;
    author: {
        name: string | null;
        username: string;
    };
    content: string;
    likeCount: number;
    likedByMe: boolean;
    replyCount: number;
    repostCount: number;
    repostedByMe: boolean;
    parent: Post | null;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
};
