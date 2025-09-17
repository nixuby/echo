import { formatRelativeTime } from '@/components/post/post';
import env from '@/env';
import {
    ArrowPathRoundedSquareIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    LinkIcon,
} from '@heroicons/react/20/solid';
import type {
    ClientNotification,
    NotificationType,
    NotificationUser,
} from '@shared/types';
import { Link } from 'react-router';
import clsx from 'clsx/lite';

export type NotificationProps = {
    notification: ClientNotification;
};

export default function Notification({ notification }: NotificationProps) {
    return (
        <div
            className={clsx(
                'relative flex items-center gap-2 border-b border-gray-800 px-4 py-2',
                notification.isRead &&
                    'opacity-50 transition-opacity duration-75 hover:opacity-100',
            )}
        >
            <div className='text-gray-400'>
                <NotificationIcon type={notification.type} />
            </div>
            <div className='flex flex-col'>
                <div className='text-sm text-gray-400'>
                    {formatRelativeTime(new Date(notification.createdAt))}
                </div>
                {(() => {
                    switch (notification.type) {
                        case 'post_liked':
                            return (
                                <div>
                                    <NotifUserProfile
                                        user={notification.data.user}
                                    />{' '}
                                    liked your{' '}
                                    <Link
                                        to={`/post/${notification.data.postId}`}
                                        className='font-semibold hover:underline'
                                    >
                                        post&nbsp;
                                        <LinkIcon className='inline size-4' />
                                    </Link>
                                </div>
                            );

                        case 'post_replied':
                            return (
                                <div>
                                    <NotifUserProfile
                                        user={notification.data.user}
                                    />{' '}
                                    <Link
                                        to={`/post/${notification.data.postId}`}
                                        className='font-semibold hover:underline'
                                    >
                                        replied&nbsp;
                                        <LinkIcon className='inline size-4' />
                                    </Link>{' '}
                                    to your post
                                </div>
                            );

                        case 'post_shared':
                            return (
                                <div>
                                    <NotifUserProfile
                                        user={notification.data.user}
                                    />{' '}
                                    shared your{' '}
                                    <Link
                                        to={`/post/${notification.data.postId}`}
                                        className='font-semibold hover:underline'
                                    >
                                        post&nbsp;
                                        <LinkIcon className='inline size-4' />
                                    </Link>
                                </div>
                            );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}

function NotificationIcon({ type }: { type: NotificationType }) {
    switch (type) {
        case 'post_liked':
            return <HeartIcon className='size-8' />;
        case 'post_replied':
            return <ChatBubbleLeftIcon className='size-8' />;
        case 'post_shared':
            return <ArrowPathRoundedSquareIcon className='size-8' />;
    }

    return null;
}

function NotifUserProfile({ user }: { user: NotificationUser }) {
    return (
        <Link
            to={`/@${user.username}`}
            className='inline-flex items-baseline gap-1 font-semibold hover:underline'
        >
            <img
                src={`${env.API_URL}/users/pic/${user.username}-sm`}
                alt={user.username}
                className='size-5 self-center rounded-full'
            />
            <span>{user.name ? user.name : `@${user.username}`}</span>
        </Link>
    );
}
