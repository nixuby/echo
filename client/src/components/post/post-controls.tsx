import {
    useLikePostMutation,
    useRepostPostMutation,
} from '@/redux/posts/posts-api';
import clsx from 'clsx/lite';
import {
    ArrowPathRoundedSquareIcon,
    BookmarkIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    ShareIcon,
} from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import playButtonAnimation from './post-button-animation';
import { useAppSelector } from '@/redux/hooks';

export type PostControlsProps = {
    id: string;
    originalId: string;
    likeCount: number;
    likedByMe: boolean;
    replyCount: number;
    repostCount: number;
    repostedByMe: boolean;
};

export default function PostControls({
    id,
    originalId,
    likeCount,
    likedByMe,
    replyCount,
    repostCount,
    repostedByMe,
}: PostControlsProps) {
    const navigate = useNavigate();
    const [likePost] = useLikePostMutation();
    const [repostPost] = useRepostPostMutation();
    const user = useAppSelector((state) => state.auth.user);

    function handleLike(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        if (!user) return;
        if (!likedByMe)
            playButtonAnimation(id, '.__like-btn-container', 'bg-rose-500');
        likePost({ id: originalId });
    }

    function handleReply(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        navigate(`/post/${originalId}#Reply`);
    }

    function handleRepost(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        if (!user) return;
        if (!repostedByMe)
            playButtonAnimation(
                id,
                '.__repost-btn-container',
                'bg-emerald-500',
            );
        repostPost({ id: originalId });
    }

    function handleBookmark(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Bookmark');
    }

    function handleShare(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Share');
    }

    return (
        <div
            id={`post-controls-${id}`}
            className='grid grid-cols-4 text-gray-500'
        >
            <div className='__like-btn-container relative'>
                <button
                    type='button'
                    onClick={handleLike}
                    className={clsx(
                        'relative z-5 -mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-indigo-300',
                        likedByMe && 'text-rose-500',
                    )}
                >
                    <HeartIcon className='size-5' />
                    <span>{likeCount}</span>
                </button>
            </div>
            <div>
                <button
                    type='button'
                    onClick={handleReply}
                    className='-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-indigo-300'
                >
                    <ChatBubbleLeftIcon className='size-5' />
                    <span>{replyCount}</span>
                </button>
            </div>
            <div className='__repost-btn-container relative'>
                <button
                    type='button'
                    onClick={handleRepost}
                    className={clsx(
                        '-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-indigo-300',
                        repostedByMe && 'text-emerald-500',
                    )}
                >
                    <ArrowPathRoundedSquareIcon className='size-5' />
                    <span>{repostCount}</span>
                </button>
            </div>
            <div className='flex items-center justify-end gap-1'>
                <button type='button' onClick={handleBookmark}>
                    <BookmarkIcon className='size-5' />
                </button>
                <button type='button' onClick={handleShare}>
                    <ShareIcon className='size-5' />
                </button>
            </div>
        </div>
    );
}
