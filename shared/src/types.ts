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
    postCount: number;
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
