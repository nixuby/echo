import clsx from 'clsx/lite';

export type ButtonProps = {
    submit?: boolean;
    children?: React.ReactNode;
} & React.ComponentProps<'button'>;

export default function Button({
    children,
    submit,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            type={submit ? 'submit' : 'button'}
            role='button'
            className={clsx(
                'cursor-pointer border border-indigo-600 bg-indigo-800 px-4 py-2 transition-colors hover:bg-indigo-700 disabled:border-gray-600 disabled:bg-gray-500',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
