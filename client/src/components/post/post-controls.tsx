import {
    useLikePostMutation,
    useRepostPostMutation,
    useSavePostMutation,
} from '@/redux/posts/posts-api';
import clsx from 'clsx/lite';
import {
    ArrowPathRoundedSquareIcon,
    BookmarkIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
} from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import playButtonAnimation from './post-button-animation';
import { useAppSelector } from '@/redux/hooks';
import type { Post } from '@shared/types';

export type PostControlsProps = {
    id: string;
    post: Post;
};

export default function PostControls({ id, post }: PostControlsProps) {
    const navigate = useNavigate();
    const [likePost] = useLikePostMutation();
    const [repostPost] = useRepostPostMutation();
    const [savePost] = useSavePostMutation();
    const user = useAppSelector((state) => state.auth.user);

    function handleLike(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        if (!user) return;
        if (!post.likedByMe) {
            playButtonAnimation(id, '.__like-btn-container', 'bg-rose-500');
        }
        likePost({ id: post.id });
    }

    function handleReply(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        navigate(`/post/${post.id}#Reply`);
    }

    function handleRepost(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        if (!user) return;
        if (!post.repostedByMe) {
            playButtonAnimation(
                id,
                '.__repost-btn-container',
                'bg-emerald-500',
            );
        }
        repostPost({ id: post.id });
    }

    function handleSave(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        if (!user) return;
        if (!post.savedByMe) {
            playButtonAnimation(id, '.__save-btn-container', 'bg-yellow-500');
        }
        savePost({ id: post.id });
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
                        post.likedByMe && 'text-rose-500',
                    )}
                >
                    <HeartIcon className='size-5' />
                    <span>{post.likeCount}</span>
                </button>
            </div>
            <div>
                <button
                    type='button'
                    onClick={handleReply}
                    className='-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-indigo-300'
                >
                    <ChatBubbleLeftIcon className='size-5' />
                    <span>{post.replyCount}</span>
                </button>
            </div>
            <div className='__repost-btn-container relative'>
                <button
                    type='button'
                    onClick={handleRepost}
                    className={clsx(
                        '-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-indigo-300',
                        post.repostedByMe && 'text-emerald-500',
                    )}
                >
                    <ArrowPathRoundedSquareIcon className='size-5' />
                    <span>{post.repostCount}</span>
                </button>
            </div>
            <div className='flex items-center justify-end gap-1'>
                <button
                    type='button'
                    onClick={handleSave}
                    className={clsx(
                        '__save-btn-container relative -mx-2 -my-1 cursor-pointer px-2 py-1 transition hover:text-indigo-300',
                        post.savedByMe && 'text-yellow-500',
                    )}
                >
                    <BookmarkIcon className='size-5' />
                </button>
            </div>
        </div>
    );
}
