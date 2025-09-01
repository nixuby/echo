import {
    Bars3Icon,
    BellIcon,
    ChatBubbleLeftIcon,
    UserIcon,
} from '@heroicons/react/20/solid';
import { Link } from 'react-router';

export default function MobileNavBar() {
    return (
        <nav className='z-21 fixed bottom-0 left-0 grid w-full grid-cols-4 border-t border-gray-800 bg-gray-950/70 backdrop-blur-sm sm:hidden'>
            <button
                type='button'
                className='flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors hover:bg-gray-900'
            >
                <Bars3Icon className='size-6' />
                <span>Menu</span>
            </button>
            <Link
                to='/messages'
                className='flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors hover:bg-gray-900'
            >
                <ChatBubbleLeftIcon className='size-6' />
                <span>Messages</span>
            </Link>
            <Link
                to='/notifications'
                className='flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors hover:bg-gray-900'
            >
                <BellIcon className='size-6' />
                <span>Notifications</span>
            </Link>
            <Link
                to='/signin'
                className='flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors hover:bg-gray-900'
            >
                <UserIcon className='size-6' />
                <span>Profile</span>
            </Link>
        </nav>
    );
}
