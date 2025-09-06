import { Link } from 'react-router';
import GoogleLogoIcon from '../icon/google-icon';
import AppleLogoIcon from '../icon/apple-icon';

const PROVIDERS = {
    google: {
        name: 'Google',
        url: '/auth/google',
        icon: <GoogleLogoIcon className='size-5' />,
    },
    apple: {
        name: 'Apple',
        url: '/auth/apple',
        icon: <AppleLogoIcon className='size-5' />,
    },
};

export type AuthProviderButtonProps = {
    type: 'signin' | 'signup';
    provider: keyof typeof PROVIDERS;
};

export default function AuthProviderButton({
    type,
    provider,
}: AuthProviderButtonProps) {
    return (
        <Link
            to={PROVIDERS[provider].url}
            className='flex cursor-pointer items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200'
        >
            {PROVIDERS[provider].icon}
            <span>
                {type === 'signin' ? 'Sign in' : 'Sign up'} with&nbsp;
                {PROVIDERS[provider].name}
            </span>
        </Link>
    );
}
