import clsx from 'clsx/lite';

export type ButtonProps = {
    submit?: boolean;
    type?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'normal' | 'large';
    children?: React.ReactNode;
} & Omit<React.ComponentProps<'button'>, 'type'>;

const BUTTON_SIZES = {
    small: 'text-sm px-4 py-1',
    normal: 'text-base px-4 py-2',
    large: 'text-lg px-4 py-3',
} as const;

const BUTTON_TYPES = {
    primary: 'bg-indigo-800 hover:bg-indigo-700 border-indigo-600',
    secondary: 'bg-gray-800 hover:bg-gray-700 border-gray-600',
    danger: 'bg-red-600 hover:bg-red-500 border-red-400',
};

export default function Button({
    children,
    submit,
    className,
    size = 'normal',
    type = 'primary',
    ...props
}: ButtonProps) {
    return (
        <button
            type={submit ? 'submit' : 'button'}
            role='button'
            className={clsx(
                'cursor-pointer border text-white transition-colors disabled:border-gray-600 disabled:bg-gray-500',
                BUTTON_SIZES[size],
                BUTTON_TYPES[type],
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
