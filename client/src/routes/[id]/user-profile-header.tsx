import MediaPreviewDialog from '@/components/dialog/media-preview-dialog';
import TitleBar from '@/components/layout/titlebar';
import Button from '@/components/shared/button';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import type { OtherClientUser } from '@shared/types';
import { Link } from 'react-router';
import UserProfileEditDialog from './user-profile-edit-dialog';
import env from '@/env';
import { useDialog } from '@/components/dialog/dialog';

function formatDate(datestr: string) {
    const date = new Date(datestr);
    return date.toLocaleDateString('en-US', {
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

    function handleClickPfp(ev: React.MouseEvent<HTMLImageElement>) {
        const src = ev.currentTarget.src;
        dialog.open(<MediaPreviewDialog url={src} />);
    }

    function handleClickEdit() {
        dialog.open(<UserProfileEditDialog />);
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
                        className='box-content size-24 rounded-full border-4 border-gray-950'
                    />
                </div>
            </div>
            <div className='flex h-14 items-center justify-end px-4'>
                {you ? (
                    <Button size='small' onClick={handleClickEdit}>
                        Edit
                    </Button>
                ) : (
                    <Button size='small'>Follow</Button>
                )}
            </div>
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
                                    <span>Get Verified</span>
                                </Link>
                            )
                        )}
                    </div>
                    <p className='text-sm text-gray-400'>@{user.username}</p>
                </div>
                <div>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Architecto incidunt aperiam similique inventore nemo nihil
                    numquam, consequatur nobis quasi atque!
                </div>

                <div className='text-gray-400'>
                    Joined {formatDate(user.createdAt)}
                </div>
                <div className='flex flex-col gap-2 sm:flex-row sm:gap-4'>
                    <div>
                        <span className='font-semibold'>0</span>&nbsp;
                        <span className='text-gray-400'>Following</span>
                    </div>
                    <div>
                        <span className='font-semibold'>0</span>&nbsp;
                        <span className='text-gray-400'>Followers</span>
                    </div>
                    <div>
                        <span className='font-semibold'>0</span>&nbsp;
                        <span className='text-gray-400'>Posts</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
