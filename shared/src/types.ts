export type ClientUser = {
    username: string;
    name: string | null;
    bio: string;
    email: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: string | null;
    isVerified: boolean;
    notificationCount: number;
    createdAt: string;
};

export type OtherClientUser = {
    username: string;
    name: string | null;
    bio: string;
    isVerified: boolean;
    createdAt: string;
    followerCount: number;
    followingCount: number;
    postCount: number;
    followedByMe: boolean;
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
    notificationCount: number;
    createdAt: string;
};

// Posts

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

// Notifications

export type NotificationUser = {
    name: string | null;
    username: string;
    isVerified: boolean;
};

export type ServerNotification =
    | {
          id: string;
          type: 'new_follower';
          data: {
              userId: string;
          };
          isRead: boolean;
          createdAt: Date;
      }
    | {
          id: string;
          type: 'post_liked' | 'post_replied' | 'post_shared';
          data: {
              postId: string;
              userId: string;
          };
          isRead: boolean;
          createdAt: Date;
      };

export type ClientNotification =
    | {
          id: string;
          type: 'new_follower';
          data: {
              user: NotificationUser;
          };
          isRead: boolean;
          createdAt: string;
      }
    | {
          id: string;
          type: 'post_liked' | 'post_replied' | 'post_shared';
          data: {
              postId: string;
              user: NotificationUser;
          };
          isRead: boolean;
          createdAt: string;
      };

export type NotificationType = ServerNotification['type'];

export const NOTIFICATION_TYPES: NotificationType[] = ['new_follower', 'post_liked', 'post_replied', 'post_shared'];

export type NotificationSettings = Record<NotificationType, boolean>;
