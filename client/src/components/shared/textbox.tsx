export type TextBoxProps = {
    label?: string;
    error?: string;
} & React.ComponentProps<'input'>;

export default function TextBox({ label, error, ...props }: TextBoxProps) {
    return (
        <label className='relative flex w-full flex-col gap-0.5'>
            <input
                placeholder=''
                className='peer w-full border border-gray-800 bg-gray-900 px-4 pt-4 pb-1 transition-shadow outline-none focus:ring-2'
                {...props}
            />
            <span
                className={
                    'pointer-events-none absolute top-2.5 left-4 origin-bottom-left text-gray-400 transition-transform ' +
                    ' peer-focus:-translate-y-[60%] peer-focus:scale-80 peer-[:not(:placeholder-shown)]:-translate-y-[60%] peer-[:not(:placeholder-shown)]:scale-80'
                }
            >
                {label}
            </span>
            {error && <span className='text-sm text-red-400'>{error}</span>}
        </label>
    );
}
