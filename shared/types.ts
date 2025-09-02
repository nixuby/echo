export type Post = {
    id: string;
    author: {
        id: string;
        name: string;
        username: string;
    };
    content: string;
    stats: PostStats;
    createdAt: Date;
};

export type PostStats = {
    likes: number;
    comments: number;
    reposts: number;
};
