import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import PostControls from './post-controls';
import { type Post as TPost } from '@shared/types';
import clsx from 'clsx/lite';
import env from '@/env';

export type PostProps = {
    clickable?: boolean;
    short?: boolean;
    post: TPost;
};

const rtf = new Intl.RelativeTimeFormat('en-US', { style: 'narrow' });
const dtf = new Intl.DateTimeFormat('en-US');

// Less than a minute ago -> "just now"
// Less that an hour ago -> "x minutes ago"
// Less than a day ago -> "x hours ago"
// Less than a month ago -> "x days ago"
// Otherwise -> "MM/DD/YY"
function formatRelativeTime(date: Date) {
    const MINUTE_MS = 60_000;
    const HOUR_MS = 3_600_000;
    const DAY_MS = 86_400_000;
    const MONTH_MS = DAY_MS * 30;

    const now = new Date();

    const diff = now.getTime() - date.getTime();

    if (diff < MINUTE_MS) {
        return 'just now';
    } else if (diff < HOUR_MS) {
        return rtf.format(-Math.floor(diff / MINUTE_MS), 'minute');
    } else if (diff < DAY_MS) {
        return rtf.format(-Math.floor(diff / HOUR_MS), 'hour');
    } else if (diff < MONTH_MS) {
        return rtf.format(-Math.floor(diff / DAY_MS), 'day');
    } else {
        return dtf.format(date);
    }
}

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
        navigate(`/@${originalPost.author.username}`);
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
                    Reposted by {post.author.name ?? post.author.username}{' '}
                    &middot; {formatRelativeTime(new Date(post.createdAt))}
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
                        className='size-6 rounded-full bg-white'
                        alt={`Profile picture of ${originalPost.author.name ?? originalPost.author.username}`}
                    />
                </button>
                <div className='flex flex-1 flex-col gap-2'>
                    <div className='flex justify-between'>
                        <div className='text-sm'>
                            <button
                                type='button'
                                role='link'
                                onClick={navigateToUser}
                                className='cursor-pointer hover:underline'
                            >
                                {originalPost.author.name && (
                                    <>
                                        <span className='font-bold'>
                                            {originalPost.author.name}
                                        </span>
                                        &nbsp;
                                    </>
                                )}
                                <span className='text-gray-600'>
                                    @{originalPost.author.username}
                                </span>
                            </button>
                            &nbsp;
                            <span>
                                &middot;{' '}
                                {formatRelativeTime(
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
