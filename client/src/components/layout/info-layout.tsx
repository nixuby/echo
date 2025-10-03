import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';

export type InfoLayoutProps = {
    title?: string;
    children?: React.ReactNode;
    className?: string;
};

export default function InfoLayout({
    title,
    children,
    className,
}: InfoLayoutProps) {
    const navigate = useNavigate();

    function handleClickBack() {
        navigate(-1);
    }

    return (
        <>
            <title>{title ? `${title} — Echo` : 'Echo'}</title>
            <div className='_bg-pattern-wave flex h-full min-h-screen flex-col bg-gray-950 text-white'>
                <div className='flex w-full max-w-screen-lg flex-1 flex-col self-center border-x border-gray-800 bg-gray-950'>
                    <header className='flex items-center gap-2 border-b border-gray-800 px-4 py-2 text-xl font-semibold'>
                        <button
                            type='button'
                            role='button'
                            onClick={handleClickBack}
                            className='cursor-pointer'
                        >
                            <ArrowLeftIcon className='size-5' />
                        </button>
                        <h1>{title}</h1>
                    </header>
                    <main className={className}>{children}</main>
                </div>
            </div>
        </>
    );
}
