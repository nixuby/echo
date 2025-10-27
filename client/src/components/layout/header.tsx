import { LanguageIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router';
import HeaderSearchBar from './header-search';
import EchoIcon from '../icon/echo-icon';

export default function Header() {
    return (
        <header className='sticky top-0 z-20 flex h-12 border-b border-gray-800 bg-gray-950/70 backdrop-blur-sm'>
            <Link
                to='/'
                className='flex items-center gap-2 px-4 font-bold transition-colors hover:bg-gray-900'
            >
                <EchoIcon className='size-6' />
                <h1>Echo</h1>
            </Link>
            <HeaderSearchBar />
            <Link
                to='/settings/language'
                className='flex items-center justify-center border-l border-gray-800 px-4 transition-colors hover:bg-gray-900'
            >
                <LanguageIcon className='size-6' />
            </Link>
        </header>
    );
}
