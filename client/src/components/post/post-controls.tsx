import { useLikePostMutation } from '@/redux/posts/posts-api';
import clsx from 'clsx/lite';
import {
    ArrowPathRoundedSquareIcon,
    BookmarkIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    ShareIcon,
} from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import playLikeAnimation from './post-like-animation';
import { useAppSelector } from '@/redux/hooks';

export type PostControlsProps = {
    id: string;
    likeCount: number;
    likedByMe: boolean;
    replyCount: number;
};

export default function PostControls({
    id,
    likeCount,
    likedByMe,
    replyCount,
}: PostControlsProps) {
    const navigate = useNavigate();
    const [likePost] = useLikePostMutation();
    const user = useAppSelector((state) => state.auth.user);

    function handleLike(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        if (!user) return;
        if (!likedByMe) playLikeAnimation(id);
        likePost({ id });
    }

    function handleReply(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        navigate(`/post/${id}#Reply`);
    }

    function handleRepost(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Repost');
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
            <div className='flex items-center gap-1.5'>
                <button
                    type='button'
                    onClick={handleRepost}
                    className='-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-indigo-300'
                >
                    <ArrowPathRoundedSquareIcon className='size-5' />
                    <span>{0}</span>
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
