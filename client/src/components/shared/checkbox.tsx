import { CheckIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx/lite';

export type CheckBoxProps = {
    children?: React.ReactNode;
    error?: string;
} & React.ComponentProps<'input'>;

export default function CheckBox({ children, error, ...props }: CheckBoxProps) {
    return (
        <label className='flex flex-col items-start gap-0.5'>
            <input type='checkbox' className='peer hidden' {...props} />
            <div className='peer-checked:[&_.-icon]:opacity-100! flex gap-1 peer-checked:[&>div:first-child]:bg-indigo-600 peer-checked:[&>div:first-child]:hover:bg-indigo-500'>
                <div
                    className={clsx(
                        'cursor-pointer border border-gray-800 bg-gray-900 p-1 transition hover:border-gray-700 hover:bg-gray-800',
                    )}
                >
                    <CheckIcon className='-icon size-4 opacity-0 transition-opacity' />
                </div>
                <div>{children}</div>
            </div>
            {error && <span className='text-sm text-red-400'>{error}</span>}
        </label>
    );
}
