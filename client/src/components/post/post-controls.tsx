import {
    BookmarkIcon,
    ChatBubbleLeftIcon,
    EyeIcon,
    HeartIcon,
    ShareIcon,
} from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';

export default function PostControls() {
    const navigate = useNavigate();

    function handleLike(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Like');
    }

    function handleReply(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Reply');
        navigate('post/123?reply');
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
        <div className='grid grid-cols-4'>
            <div>
                <button
                    type='button'
                    onClick={handleLike}
                    className='-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-rose-200'
                >
                    <HeartIcon className='size-5' />
                    <span>143</span>
                </button>
            </div>
            <div>
                <button
                    type='button'
                    onClick={handleReply}
                    className='-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors hover:text-sky-200'
                >
                    <ChatBubbleLeftIcon className='size-5' />
                    <span>42</span>
                </button>
            </div>
            <div className='flex items-center gap-1.5'>
                <EyeIcon className='size-5' />
                <span>123</span>
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
