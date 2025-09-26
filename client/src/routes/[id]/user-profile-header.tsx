import MediaPreviewDialog from '@/components/dialog/media-preview-dialog';
import TitleBar from '@/components/layout/titlebar';
import Button from '@/components/shared/button';
import {
    ChatBubbleLeftIcon,
    CheckBadgeIcon,
    PencilIcon,
    UserPlusIcon,
} from '@heroicons/react/20/solid';
import type { OtherClientUser } from '@shared/types';
import { Link } from 'react-router';
import UserProfileEditDialog from './user-profile-edit-dialog';
import env from '@/env';
import { useDialog } from '@/components/dialog/dialog';
import { useFollowMutation } from '@/redux/user/users-api';
import { t } from '@/i18next';

function formatDate(locale: string, datestr: string) {
    const date = new Date(datestr);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export type UserProfileHeaderProps = {
    user: OtherClientUser;
    you: boolean;
};

export default function UserProfileHeader({
    user,
    you,
}: UserProfileHeaderProps) {
    const dialog = useDialog();
    const [follow] = useFollowMutation();

    function handleClickPfp(ev: React.MouseEvent<HTMLImageElement>) {
        const src = ev.currentTarget.src;
        dialog.open(<MediaPreviewDialog url={src} />);
    }

    function handleClickEdit() {
        dialog.open(<UserProfileEditDialog />);
    }

    function handleClickFollow() {
        follow(user.username);
    }

    return (
        <div className='flex flex-col'>
            <TitleBar>{user.name ?? `@${user.username}`}</TitleBar>
            <div className='relative'>
                <div className='border-b border-gray-800'>
                    <div className='h-48 bg-gray-900' />
                </div>
                <div className='absolute bottom-0 left-4 translate-y-1/2'>
                    <img
                        src={`${env.API_URL}/users/pic/${user.username}`}
                        alt={`Profile picture of ${user.name ?? user.username}`}
                        onClick={handleClickPfp}
                        data-user={user.username}
                        className='__pfp box-content size-24 rounded-full border-4 border-gray-950'
                    />
                </div>
            </div>
            <div className='h-12' />
            <div className='flex flex-col gap-2 border-b border-gray-800 px-4 py-2'>
                <div>
                    <div className='flex gap-2'>
                        <h2 className='font-semibold'>
                            {user.name ?? user.username}
                        </h2>
                        {user.isVerified ? (
                            <div className='flex items-center'>
                                <CheckBadgeIcon className='size-4 text-indigo-600' />
                            </div>
                        ) : (
                            you && (
                                <Link
                                    to='/verify'
                                    className='flex items-center gap-1 border border-gray-700 bg-gray-900 px-2 py-0.5 text-xs font-semibold transition-colors hover:bg-gray-800'
                                >
                                    <CheckBadgeIcon className='size-4 text-indigo-600' />
                                    <span>{t('profile.get-verified')}</span>
                                </Link>
                            )
                        )}
                    </div>
                    <p className='text-sm text-gray-400'>@{user.username}</p>
                </div>
                {user.bio.length > 0 && (
                    <div className='whitespace-pre'>{user.bio}</div>
                )}
                <div className='text-gray-400'>
                    {t('profile.joined', {
                        date: formatDate(t('locale'), user.createdAt),
                    })}
                </div>
                <div className='flex flex-col gap-2 sm:flex-row sm:gap-4'>
                    <div>
                        <span className='font-semibold'>
                            {user.followingCount}
                        </span>
                        &nbsp;
                        <span className='text-gray-400'>
                            {t('profile.following')}
                        </span>
                    </div>
                    <div>
                        <span className='font-semibold'>
                            {user.followerCount}
                        </span>
                        &nbsp;
                        <span className='text-gray-400'>
                            {t('profile.followers')}
                        </span>
                    </div>
                    <div>
                        <span className='font-semibold'>{user.postCount}</span>
                        &nbsp;
                        <span className='text-gray-400'>
                            {t('profile.posts')}
                        </span>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {you ? (
                        <>
                            <Button
                                size='small'
                                onClick={handleClickEdit}
                                className='flex items-center gap-1'
                            >
                                <PencilIcon className='size-4' />
                                <span>{t('profile.edit')}</span>
                            </Button>
                            <Button
                                size='small'
                                className='flex items-center gap-1'
                            >
                                <ChatBubbleLeftIcon className='size-4' />
                                <span>{t('profile.message')}</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            {user.followedByMe ? (
                                <Button
                                    size='small'
                                    type='secondary'
                                    onClick={handleClickFollow}
                                    className='flex items-center gap-1'
                                >
                                    <UserPlusIcon className='size-4' />
                                    <span>{t('profile.unfollow')}</span>
                                </Button>
                            ) : (
                                <Button
                                    size='small'
                                    onClick={handleClickFollow}
                                    className='flex items-center gap-1'
                                >
                                    <UserPlusIcon className='size-4' />
                                    <span>{t('profile.follow')}</span>
                                </Button>
                            )}
                            <Button
                                size='small'
                                className='flex items-center gap-1'
                            >
                                <ChatBubbleLeftIcon className='size-4' />
                                <span>{t('profile.message')}</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
