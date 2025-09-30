import { Post } from '@shared/types.js';

export type SafePostSelect = {
    id: true;
    type: true;
    author: {
        select: {
            name: true;
            username: true;
            isVerified: true;
        };
    };
    content: true;
    likeCount: true;
    replyCount: true;
    repostCount: true;
    createdAt: true;
    updatedAt: true;
    likes:
        | false
        | {
              where: { userId: string };
              select: { id: true };
          };
    parentId: boolean;
    parent: false | { select: SafePostSelect };
    attachments: { select: { id: true; type: true } };
    _count:
        | false
        | {
              select: {
                  children: {
                      where: { type: 'REPOST'; userId: string };
                  };
              };
          };
};

export const SAFE_POST_SELECT = (
    userId?: string,
    withParent?: boolean
): SafePostSelect => ({
    id: true,
    type: true,
    author: {
        select: {
            name: true,
            username: true,
            isVerified: true,
        },
    },
    content: true,
    likeCount: true,
    replyCount: true,
    repostCount: true,
    createdAt: true,
    updatedAt: true,
    likes: userId
        ? {
              where: { userId: userId },
              select: { id: true },
          }
        : false,
    parentId: withParent ?? false,
    parent: withParent
        ? {
              select: SAFE_POST_SELECT(userId, false),
          }
        : false,
    attachments: {
        select: {
            id: true,
            type: true,
        },
    },
    _count: userId
        ? {
              select: {
                  children: {
                      where: { type: 'REPOST', userId },
                  },
              },
          }
        : false,
});

export function toClientPost(post: any): Post {
    return {
        id: post.id,
        type: post.type,
        author: post.author,
        content: post.content,
        likeCount: post.likeCount,
        likedByMe: post.likes?.length > 0,
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        repostedByMe: post._count?.children > 0,
        parentId: post.parentId,
        parent: post.parent ? toClientPost(post.parent) : null,
        attachments: post.attachments,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
}
