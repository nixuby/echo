import env from '@/env';
import {
    ArrowPathRoundedSquareIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    LinkIcon,
    UserPlusIcon,
} from '@heroicons/react/20/solid';
import type {
    ClientNotification,
    NotificationType,
    NotificationUser,
} from '@shared/types';
import { Link } from 'react-router';
import clsx from 'clsx/lite';
import formatRelativeDate from '@/util/format-relative-date';
import { t } from '@/i18next';
import { Trans } from 'react-i18next';
import i18next from 'i18next';

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
                    {formatRelativeDate(
                        t('locale'),
                        new Date(notification.createdAt),
                    )}
                </div>
                {(() => {
                    switch (notification.type) {
                        case 'post_liked':
                            return (
                                <div>
                                    <Trans
                                        i18n={i18next}
                                        i18nKey='notifications.types.post_liked.description'
                                        components={{
                                            1: (
                                                <NotifUserProfile
                                                    user={
                                                        notification.data.user
                                                    }
                                                />
                                            ),
                                            2: (
                                                <PostLink
                                                    postId={
                                                        notification.data.postId
                                                    }
                                                ></PostLink>
                                            ),
                                        }}
                                    />
                                </div>
                            );

                        case 'post_replied':
                            return (
                                <div>
                                    <Trans
                                        i18n={i18next}
                                        i18nKey='notifications.types.post_replied.description'
                                        components={{
                                            1: (
                                                <NotifUserProfile
                                                    user={
                                                        notification.data.user
                                                    }
                                                />
                                            ),
                                            2: (
                                                <PostLink
                                                    postId={
                                                        notification.data.postId
                                                    }
                                                ></PostLink>
                                            ),
                                        }}
                                    />
                                </div>
                            );

                        case 'post_shared':
                            return (
                                <div>
                                    <Trans
                                        i18n={i18next}
                                        i18nKey='notifications.types.post_shared.description'
                                        components={{
                                            1: (
                                                <NotifUserProfile
                                                    user={
                                                        notification.data.user
                                                    }
                                                />
                                            ),
                                            2: (
                                                <PostLink
                                                    postId={
                                                        notification.data.postId
                                                    }
                                                ></PostLink>
                                            ),
                                        }}
                                    />
                                </div>
                            );

                        case 'new_follower':
                            return (
                                <div>
                                    <Trans
                                        i18n={i18next}
                                        i18nKey='notifications.types.new_follower.description'
                                        components={{
                                            1: (
                                                <NotifUserProfile
                                                    user={
                                                        notification.data.user
                                                    }
                                                />
                                            ),
                                        }}
                                    />
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
        case 'new_follower':
            return <UserPlusIcon className='size-8' />;
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

function PostLink({
    postId,
    children,
}: {
    postId: string;
    children?: React.ReactNode;
}) {
    return (
        <Link to={`/post/${postId}`} className='font-semibold hover:underline'>
            {children}&nbsp;
            <LinkIcon className='inline size-4' />
        </Link>
    );
}
