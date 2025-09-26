import {
    CheckBadgeIcon,
    EllipsisVerticalIcon,
} from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import PostControls from './post-controls';
import { type Post as TPost } from '@shared/types';
import clsx from 'clsx/lite';
import env from '@/env';
import PostAttachments from './post-attachments';
import formatRelativeDate from '@/util/format-relative-date';
import { t } from '@/i18next';

export type PostProps = {
    clickable?: boolean;
    short?: boolean;
    post: TPost;
};

export default function Post({
    clickable = true,
    short = false,
    post,
}: PostProps) {
    const navigate = useNavigate();

    const repost = post.type === 'REPOST';
    const originalPost = repost && post.parent ? post.parent : post;

    function navigateToPost(ev: React.MouseEvent<HTMLElement>) {
        ev.stopPropagation();
        navigate(`/post/${originalPost.id}`);
    }

    function navigateToUser(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        const path = location.pathname;
        const target = `/@${originalPost.author.username}`;
        if (path === target) return;
        navigate(target);
        window.scrollTo(0, 0);
    }

    function handleClickMenu(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Menu');
    }

    return (
        <article
            onClick={clickable ? navigateToPost : undefined}
            className={clsx(
                'flex flex-col items-start gap-2 border-b border-gray-800 px-4 py-3 transition-colors',
                clickable && 'cursor-pointer hover:bg-gray-900',
            )}
        >
            {repost && (
                <div className='text-sm font-semibold text-gray-400'>
                    {t('post.reposted-by', {
                        name: post.author.name ?? post.author.username,
                    })}{' '}
                    &middot;{' '}
                    {formatRelativeDate(t('locale'), new Date(post.createdAt))}
                </div>
            )}
            <div className='flex w-full items-start gap-2'>
                <button
                    type='button'
                    role='link'
                    onClick={navigateToUser}
                    className='cursor-pointer transition-transform hover:scale-110'
                >
                    <img
                        src={`${env.API_URL}/users/pic/${originalPost.author.username}-sm`}
                        className='__pfp size-6 rounded-full bg-white'
                        data-user={originalPost.author.username}
                        alt={`Profile picture of ${originalPost.author.name ?? originalPost.author.username}`}
                    />
                </button>
                <div className='flex flex-1 flex-col gap-2'>
                    <div className='flex justify-between'>
                        <div className='flex items-center gap-1 text-sm'>
                            <button
                                type='button'
                                role='link'
                                onClick={navigateToUser}
                                className='flex cursor-pointer items-center gap-1 hover:underline'
                            >
                                {originalPost.author.name && (
                                    <>
                                        <span className='font-bold'>
                                            {originalPost.author.name}
                                        </span>
                                        {originalPost.author.isVerified && (
                                            <CheckBadgeIcon className='size-4 text-indigo-600' />
                                        )}
                                    </>
                                )}
                                <span className='flex items-center gap-1 text-gray-600'>
                                    @{originalPost.author.username}
                                    {!originalPost.author.name &&
                                        originalPost.author.isVerified && (
                                            <CheckBadgeIcon className='size-4 text-indigo-600' />
                                        )}
                                </span>
                            </button>
                            <span>
                                &middot;{' '}
                                {formatRelativeDate(
                                    t('locale'),
                                    new Date(originalPost.createdAt),
                                )}
                            </span>
                        </div>
                        <button type='button' onClick={handleClickMenu}>
                            <EllipsisVerticalIcon className='size-5' />
                        </button>
                    </div>
                    <div
                        className={clsx(
                            'whitespace-pre-wrap',
                            short && 'line-clamp-4',
                        )}
                    >
                        {originalPost.content}
                    </div>
                    <PostAttachments attachments={originalPost.attachments} />
                    <PostControls
                        id={post.id}
                        originalId={originalPost.id}
                        likeCount={originalPost.likeCount}
                        likedByMe={originalPost.likedByMe}
                        replyCount={originalPost.replyCount}
                        repostCount={originalPost.repostCount}
                        repostedByMe={originalPost.repostedByMe}
                    />
                </div>
            </div>
        </article>
    );
}
