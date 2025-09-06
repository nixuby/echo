import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router';

export type SettingsLinkProps = {
    to: string;
    title: string;
    subtitle: string;
};

export default function SettingsLink({
    to,
    title,
    subtitle,
}: SettingsLinkProps) {
    return (
        <Link
            to={to}
            className='flex items-center justify-between bg-gray-950 px-4 py-2 transition-colors hover:bg-gray-900'
        >
            <div>
                <h3 className='font-semibold'>{title}</h3>
                <p className='text-sm text-gray-500'>{subtitle}</p>
            </div>
            <ChevronRightIcon className='size-6 text-gray-500' />
        </Link>
    );
}
