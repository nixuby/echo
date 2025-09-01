import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';
import PostControls from './post-controls';

export type PostProps = {};

export default function Post({}: PostProps) {
    const navigate = useNavigate();

    function navigateToPost(ev: React.MouseEvent<HTMLElement>) {
        ev.stopPropagation();
        navigate('post/123');
    }

    function navigateToUser(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        navigate('user/123');
    }

    function handleClickMenu(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        console.log('Menu');
    }

    return (
        <article
            onClick={navigateToPost}
            className='flex cursor-pointer items-start gap-2 border-b border-gray-800 px-4 py-3 transition-colors hover:bg-gray-900'
        >
            <button type='button' role='link' onClick={navigateToUser}>
                <div className='size-6 rounded-full bg-white' />
            </button>
            <div className='flex flex-col gap-2'>
                <div className='flex justify-between'>
                    <div className='text-sm'>
                        <button
                            type='button'
                            role='link'
                            onClick={navigateToUser}
                        >
                            <span className='font-bold'>Username</span>
                            &nbsp;
                            <span className='text-gray-600'>@username</span>
                        </button>
                        &nbsp;
                        <span>&middot; 2h ago</span>
                    </div>
                    <button type='button' onClick={handleClickMenu}>
                        <EllipsisVerticalIcon className='size-5' />
                    </button>
                </div>
                <div>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Omnis ipsum fugiat doloremque. Sequi est molestiae
                    necessitatibus ducimus earum neque cum.
                </div>
                <PostControls />
            </div>
        </article>
    );
}
