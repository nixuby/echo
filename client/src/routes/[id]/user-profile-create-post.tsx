import Button from '@/components/shared/button';
import { usePublishPostMutation } from '@/redux/posts/posts-api';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function UserProfileCreatePost() {
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');
    const [publishPost] = usePublishPostMutation();

    function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
        setContent(ev.target.value);
    }

    function handlePublish() {
        publishPost({ content })
            .unwrap()
            .then((post) => {
                navigate(`/post/${post.id}`);
            })
            .catch((res) => {
                const error = (res?.errors?.root as string) ?? 'Unknown error';
                console.error('Failed to publish post: ' + error);
            });
    }

    return (
        <div className='flex flex-col gap-2 border-b border-gray-800 px-4 py-2'>
            <textarea
                name='post'
                onChange={handleChange}
                value={content}
                className='h-24 w-full resize-none border border-gray-700 bg-gray-900 px-4 py-2 transition-colors outline-none focus:border-white focus:bg-gray-800'
            ></textarea>
            <div className='flex justify-between'>
                <Button className='flex items-center gap-1'>
                    <PaperClipIcon className='size-5' />
                    <span>Attach</span>
                </Button>
                <Button
                    onClick={handlePublish}
                    className='flex items-center gap-1'
                >
                    <span>Post</span>
                    <PaperAirplaneIcon className='size-5' />
                </Button>
            </div>
        </div>
    );
}
