import Button from '@/components/shared/button';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/20/solid';

export default function UserProfileCreatePost() {
    return (
        <div className='flex flex-col gap-2 border-b border-gray-800 px-4 py-2'>
            <textarea
                name='post'
                className='h-24 w-full resize-none border border-gray-700 bg-gray-900 px-4 py-2 transition-colors outline-none focus:border-white focus:bg-gray-800'
            ></textarea>
            <div className='flex justify-between'>
                <Button className='flex items-center gap-1'>
                    <PaperClipIcon className='size-5' />
                    <span>Attach</span>
                </Button>
                <Button className='flex items-center gap-1'>
                    <span>Post</span>
                    <PaperAirplaneIcon className='size-5' />
                </Button>
            </div>
        </div>
    );
}
