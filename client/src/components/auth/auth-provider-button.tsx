import { Link } from 'react-router';
import GoogleLogoIcon from '../icon/google-icon';
import { t } from '@/i18next';
import env from '@/env';

const PROVIDERS = {
    google: {
        url: env.GOOGLE_OAUTH_URL,
        icon: <GoogleLogoIcon className='size-5' />,
    },
};

export type AuthProviderButtonProps = {
    provider: keyof typeof PROVIDERS;
};

export default function AuthProviderButton({
    provider,
}: AuthProviderButtonProps) {
    return (
        <Link
            to={PROVIDERS[provider].url}
            className='flex cursor-pointer items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200'
        >
            {PROVIDERS[provider].icon}
            <span>{t(`sign-in-${provider}`)}</span>
        </Link>
    );
}
