type PrismaSelect<T> = {
    [K in keyof T]: true;
};

export type ClientUser = {
    username: string;
    name: string | null;
    bio: string;
    email: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: string | null;
    isVerified: boolean;
    createdAt: string;
};

export type OtherClientUser = {
    username: string;
    name: string | null;
    bio: string;
    isVerified: boolean;
    createdAt: string;
};

export type ServerUser = {
    id: string;
    username: string;
    name: string | null;
    bio: string;
    email: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: string | null; // Date string
    isVerified: boolean;
    createdAt: string;
};

//

export const CLIENT_USER_SELECT: PrismaSelect<ClientUser> = {
    username: true,
    name: true,
    bio: true,
    email: true,
    isEmailVerified: true,
    emailVerifiedAt: true,
    isVerified: true,
    createdAt: true,
};

export const OTHER_CLIENT_USER_SELECT: PrismaSelect<OtherClientUser> = {
    username: true,
    name: true,
    bio: true,
    isVerified: true,
    createdAt: true,
};

export const SERVER_USER_SELECT: PrismaSelect<ServerUser> = {
    id: true,
    username: true,
    name: true,
    bio: true,
    email: true,
    isEmailVerified: true,
    emailVerifiedAt: true,
    isVerified: true,
    createdAt: true,
};

//

export type PostType = 'ORIGINAL' | 'REPLY' | 'REPOST';

export type Post = {
    id: string;
    type: PostType;
    author: {
        name: string | null;
        username: string;
        isVerified: boolean;
    };
    content: string;
    likeCount: number;
    likedByMe: boolean;
    replyCount: number;
    repostCount: number;
    repostedByMe: boolean;
    parent: Post | null;
    parentId: string | null;
    attachments: Array<PostAttachment>;
    createdAt: string;
    updatedAt: string;
};

export type PostAttachment = {
    id: string;
    type: string; // MIME type
};
