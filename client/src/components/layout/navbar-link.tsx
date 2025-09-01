import clsx from 'clsx/lite';
import { Link } from 'react-router';

export type NavBarLinkProps = {
    children?: React.ReactNode;
    to: string;
    active: boolean;
};

export default function NavBarLink({ children, to, active }: NavBarLinkProps) {
    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-800',
                active && 'font-bold',
            )}
        >
            {children}
        </Link>
    );
}
