import { LanguageIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router';

export default function Header() {
    return (
        <header className='sticky top-0 z-20 flex h-12 border-b border-gray-800 bg-gray-950/70 backdrop-blur-sm'>
            <Link
                to='/'
                className='flex items-center gap-2 px-4 font-bold transition-colors hover:bg-gray-900'
            >
                <img src='/echo.svg' alt='Logo' className='size-6' />
                <h1>Echo</h1>
            </Link>

            <input
                type='text'
                placeholder='Search'
                className='grow border-l border-gray-800 px-4 transition-colors outline-none hover:bg-gray-900 focus:bg-gray-800 focus:ring'
            />

            <Link
                to='/settings/language'
                className='flex items-center justify-center border-l border-gray-800 px-4 transition-colors hover:bg-gray-900'
            >
                <LanguageIcon className='size-6' />
            </Link>
        </header>
    );
}
