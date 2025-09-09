import Footer from './footer';
import NavBarLink from './navbar-link';
import clsx from 'clsx/lite';
import {
    BellIcon,
    BriefcaseIcon,
    ChatBubbleLeftIcon,
    Cog6ToothIcon,
    HomeIcon,
    StarIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/20/solid';
import { Link, useLocation } from 'react-router';
import { useAppSelector } from '../../redux/hooks';

export type NavBarProps = {
    mobile?: boolean;
};

export default function NavBar({ mobile }: NavBarProps) {
    const user = useAppSelector((s) => s.auth.user);

    const { pathname } = useLocation();

    return (
        <nav
            className={clsx(
                'sticky top-12 hidden h-[calc(100vh_-_3rem)] w-64 min-w-64 flex-col justify-between overflow-y-auto border-r border-gray-800 sm:flex',
                mobile && 'flex!',
            )}
        >
            <div className='flex flex-col'>
                <div className='flex flex-col border-b border-gray-800'>
                    <NavBarLink to='/' active={pathname === '/'}>
                        <HomeIcon className='size-6' />
                        <span>Home</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/notifications'
                        active={pathname.startsWith('/notifications')}
                    >
                        <BellIcon className='size-6' />
                        <span>Notifications</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/messages'
                        active={pathname.startsWith('/messages')}
                    >
                        <ChatBubbleLeftIcon className='size-6' />
                        <span>Messages</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/communities'
                        active={pathname.startsWith('/communities')}
                    >
                        <UserGroupIcon className='size-6' />
                        <span>Communities</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/premium'
                        active={pathname.startsWith('/premium')}
                    >
                        <StarIcon className='size-6' />
                        <span>Premium</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/career'
                        active={pathname.startsWith('/career')}
                    >
                        <BriefcaseIcon className='size-6' />
                        <span>Career</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/settings'
                        active={pathname.startsWith('/settings')}
                    >
                        <Cog6ToothIcon className='size-6' />
                        <span>Settings</span>
                    </NavBarLink>
                    {!user && (
                        <NavBarLink to='/sign-in' active={false}>
                            <UserIcon className='size-6' />
                            <span>Sign In</span>
                        </NavBarLink>
                    )}
                </div>
                {user && (
                    <Link
                        to={user ? `/@${user.username}` : '/sign-in'}
                        className='flex items-center gap-4 border-b border-gray-800 px-4 py-3 transition-colors hover:bg-gray-900'
                    >
                        <img
                            src={`http://localhost:5179/api/users/pic/${user.username}`}
                            alt={`Profile picture of ${user.name ?? user.username}`}
                            className='size-12 rounded-full'
                        />
                        <div className='flex flex-col'>
                            {user.name ? (
                                <div>
                                    <div>{user.name}</div>
                                    <div className='text-sm text-gray-400'>
                                        @{user.username}
                                    </div>
                                </div>
                            ) : (
                                <div>@{user.username}</div>
                            )}
                        </div>
                    </Link>
                )}
            </div>
            <Footer />
        </nav>
    );
}
