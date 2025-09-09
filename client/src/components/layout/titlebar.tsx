import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router';

export type TitleBarProps = {
    children: string;
};

export default function TitleBar({ children }: TitleBarProps) {
    const navigate = useNavigate();

    function handleClickBack() {
        navigate(-1);
    }

    return (
        <div className='flex items-center gap-2 border-b border-gray-800 px-4 py-2'>
            <button
                type='button'
                role='button'
                onClick={handleClickBack}
                className='cursor-pointer'
            >
                <ArrowLeftIcon className='size-5' />
            </button>
            <h2 className='text-xl font-bold'>{children}</h2>
        </div>
    );
}
