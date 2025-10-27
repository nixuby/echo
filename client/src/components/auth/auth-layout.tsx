import { t } from '@/i18next';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router';
import EchoIcon from '../icon/echo-icon';

export type AuthLayoutProps = {
    noclose?: boolean;
    title?: string; // Page title
    children?: React.ReactNode;
};

export default function AuthLayout({
    noclose,
    title,
    children,
}: AuthLayoutProps) {
    return (
        <>
            <title>{title ? `${title} — Echo` : 'Echo'}</title>
            <div className='_bg-pattern-wave flex h-full min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 p-4 text-white'>
                <header>
                    <Link to='/'>
                        <h1 className='flex items-center gap-2 font-bold'>
                            <EchoIcon className='size-8' />
                            <span>Echo</span>
                        </h1>
                    </Link>
                </header>
                <div className='flex w-[min(100%,350px)] flex-col gap-2 border border-gray-800 bg-gray-950 p-6'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-xl font-bold'>{title}</h2>
                        {!noclose && (
                            <Link to='/'>
                                <XMarkIcon className='size-6' />
                            </Link>
                        )}
                    </div>
                    <main>{children}</main>
                </div>
                <footer className='flex gap-2 text-xs text-gray-400'>
                    <Link to='/tos' className='text-nowrap hover:underline'>
                        {t('terms')}
                    </Link>
                    <Link to='/privacy' className='text-nowrap hover:underline'>
                        {t('privacy')}
                    </Link>
                </footer>
            </div>
        </>
    );
}
