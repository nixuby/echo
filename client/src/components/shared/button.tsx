import clsx from 'clsx/lite';

export type ButtonProps = {
    submit?: boolean;
    size?: 'small' | 'normal' | 'large';
    children?: React.ReactNode;
} & React.ComponentProps<'button'>;

const BUTTON_SIZES = {
    small: 'text-sm px-4 py-1',
    normal: 'text-base px-4 py-2',
    large: 'text-lg px-4 py-3',
} as const;

export default function Button({
    children,
    submit,
    className,
    size = 'normal',
    ...props
}: ButtonProps) {
    return (
        <button
            type={submit ? 'submit' : 'button'}
            role='button'
            className={clsx(
                'cursor-pointer border border-indigo-600 bg-indigo-800 transition-colors hover:bg-indigo-700 disabled:border-gray-600 disabled:bg-gray-500',
                BUTTON_SIZES[size],
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
