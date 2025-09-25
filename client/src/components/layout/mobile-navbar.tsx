import { useAppSelector } from '@/redux/hooks';
import {
    Bars3Icon,
    BellIcon,
    ChatBubbleLeftIcon,
    UserIcon,
} from '@heroicons/react/20/solid';
import { Link } from 'react-router';
import MobileMenu from './mobile-menu';
import { useState } from 'react';

export default function MobileNavBar() {
    const user = useAppSelector((s) => s.auth.user);
    const [isOpen, setIsOpen] = useState(false);

    function handleClickMenu() {
        setIsOpen(true);
    }

    function handleMenuClose() {
        setIsOpen(false);
    }

    return (
        <>
            {isOpen && <MobileMenu onClose={handleMenuClose} />}
            <nav className='fixed bottom-0 left-0 z-21 grid h-16 w-full grid-cols-4 border-t border-gray-800 bg-gray-950/70 backdrop-blur-sm sm:hidden'>
                <button
                    type='button'
                    onClick={handleClickMenu}
                    className='flex flex-col items-center justify-center gap-1 text-sm transition-colors hover:bg-gray-900'
                >
                    <Bars3Icon className='size-6' />
                    <span>Menu</span>
                </button>
                <Link
                    to='/message'
                    className='flex flex-col items-center justify-center gap-1 text-sm transition-colors hover:bg-gray-900'
                >
                    <ChatBubbleLeftIcon className='size-6' />
                    <span>Messages</span>
                </Link>
                <Link
                    to='/notifications'
                    className='flex flex-col items-center justify-center gap-1 text-sm transition-colors hover:bg-gray-900'
                >
                    <BellIcon className='size-6' />
                    <span>Notifications</span>
                </Link>
                <Link
                    to={user ? `/@${user.username}` : '/sign-in'}
                    className='flex flex-col items-center justify-center gap-1 text-sm transition-colors hover:bg-gray-900'
                >
                    <UserIcon className='size-6' />
                    <span>Profile</span>
                </Link>
            </nav>
        </>
    );
}
