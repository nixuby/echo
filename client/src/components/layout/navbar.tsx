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
import env from '@/env';
import { t } from '@/i18next';

export type NavBarProps = {
    mobile?: boolean;
};

export default function NavBar({ mobile }: NavBarProps) {
    const user = useAppSelector((s) => s.auth.user);

    const { pathname } = useLocation();

    return (
        <nav
            className={clsx(
                'hidden w-64 min-w-64 flex-col justify-between overflow-y-auto border-r border-gray-800 bg-gray-950 text-white sm:flex',
                !mobile && 'sticky top-12 h-[calc(100vh_-_3rem)]',
                mobile && 'flex! h-full',
            )}
        >
            <div className='flex flex-col'>
                <div className='flex flex-col border-b border-gray-800'>
                    <NavBarLink to='/' active={pathname === '/'}>
                        <HomeIcon className='size-6' />
                        <span>{t('home')}</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/notifications'
                        active={pathname.startsWith('/notifications')}
                    >
                        <div className='relative'>
                            <BellIcon className='size-6' />
                            {user?.notificationCount &&
                            user.notificationCount > 0 ? (
                                <div className='absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-500' />
                            ) : null}
                        </div>
                        <span>
                            {t('notifications.label')}
                            {user?.notificationCount &&
                            user.notificationCount > 0 ? (
                                <>&nbsp;({user?.notificationCount})</>
                            ) : null}
                        </span>
                    </NavBarLink>
                    <NavBarLink
                        to='/message'
                        active={pathname.startsWith('/message')}
                    >
                        <ChatBubbleLeftIcon className='size-6' />
                        <span>{t('messages.label')}</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/communities'
                        active={pathname.startsWith('/communities')}
                    >
                        <UserGroupIcon className='size-6' />
                        <span>{t('communities')}</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/premium'
                        active={pathname.startsWith('/premium')}
                    >
                        <StarIcon className='size-6' />
                        <span>{t('premium')}</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/career'
                        active={pathname.startsWith('/career')}
                    >
                        <BriefcaseIcon className='size-6' />
                        <span>{t('career')}</span>
                    </NavBarLink>
                    <NavBarLink
                        to='/settings'
                        active={pathname.startsWith('/settings')}
                    >
                        <Cog6ToothIcon className='size-6' />
                        <span>{t('settings.label')}</span>
                    </NavBarLink>
                    {!user && (
                        <NavBarLink to='/sign-in' active={false}>
                            <UserIcon className='size-6' />
                            <span>{t('sign-in')}</span>
                        </NavBarLink>
                    )}
                </div>
                {user && (
                    <Link
                        to={user ? `/@${user.username}` : '/sign-in'}
                        className='flex items-center gap-4 border-b border-gray-800 px-4 py-3 transition-colors hover:bg-gray-900'
                    >
                        <img
                            src={`${env.API_URL}/users/pic/${user.username}`}
                            alt={`Profile picture of ${user.name ?? user.username}`}
                            data-user={user.username}
                            className='__pfp size-12 rounded-full'
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
