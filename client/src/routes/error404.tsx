import { Link } from 'react-router';

export default function Error404Page() {
    return (
        <>
            <title>Not Found — Echo</title>
            <div className='_bg-pattern-wave flex h-full min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 p-4 text-white'>
                <header>
                    <Link to='/'>
                        <h1 className='flex items-center gap-2 font-bold'>
                            <img src='/echo.svg' className='size-8' />
                            <span>Echo</span>
                        </h1>
                    </Link>
                </header>
                <div className='flex w-[min(100%,350px)] flex-col gap-2 border border-gray-800 bg-gray-950 p-6'>
                    <h2 className='text-xl font-bold'>Not Found</h2>
                    <div>This page does not exist</div>
                    <Link
                        to='/'
                        className='border border-indigo-600 bg-indigo-800 px-4 py-2 text-center transition-colors hover:bg-indigo-700'
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </>
    );
}
