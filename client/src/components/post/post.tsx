import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import PostControls from './post-controls';
import { type Post as TPost } from '@shared/types';
import clsx from 'clsx/lite';

export type PostProps = {
    clickable?: boolean;
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

export default function Post({ post, clickable = true }: PostProps) {
    const navigate = useNavigate();

    function navigateToPost(ev: React.MouseEvent<HTMLElement>) {
        ev.stopPropagation();
        navigate(`/post/${post.id}`);
    }

    function navigateToUser(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        navigate(`/@${post.author.username}`);
    }

    function handleClickMenu(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Menu');
    }

    return (
        <article
            onClick={clickable ? navigateToPost : undefined}
            className={clsx(
                'flex items-start gap-2 border-b border-gray-800 px-4 py-3 transition-colors',
                clickable && 'cursor-pointer hover:bg-gray-900',
            )}
        >
            <button
                type='button'
                role='link'
                onClick={navigateToUser}
                className='cursor-pointer transition-transform hover:scale-110'
            >
                <div className='size-6 rounded-full bg-white' />
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
                            {post.author.name && (
                                <>
                                    <span className='font-bold'>
                                        {post.author.name}
                                    </span>
                                    &nbsp;
                                </>
                            )}
                            <span className='text-gray-600'>
                                @{post.author.username}
                            </span>
                        </button>
                        &nbsp;
                        <span>
                            &middot;{' '}
                            {formatRelativeTime(new Date(post.createdAt))}
                        </span>
                    </div>
                    <button type='button' onClick={handleClickMenu}>
                        <EllipsisVerticalIcon className='size-5' />
                    </button>
                </div>
                <div>{post.content}</div>
                <PostControls stats={{ likes: 0, comments: 0, reposts: 0 }} />
            </div>
        </article>
    );
}
