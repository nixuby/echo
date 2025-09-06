import { Link } from 'react-router';
import Layout from '../../components/layout/layout';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export default function SettingsPage() {
    return (
        <Layout title='Settings'>
            <div className='flex flex-col'>
                <h2 className='border-b border-gray-800 px-4 py-2 text-xl font-bold'>
                    Settings
                </h2>
                <div className='flex flex-col border-b border-gray-800'>
                    <SettingsLink
                        to='/settings/account-info'
                        title='Account information'
                        subtitle='Manage your account information like name, username, and email'
                    />
                    <SettingsLink
                        to='/settings/change-password'
                        title='Change password'
                        subtitle='Update your password to keep your account secure'
                    />
                    <SettingsLink
                        to='/settings/notifications'
                        title='Notifications'
                        subtitle='Manage your notification preferences'
                    />
                    <SettingsLink
                        to='/settings/language'
                        title='Language'
                        subtitle='Manage your language preferences'
                    />
                    <SettingsLink
                        to='/help'
                        title='Help'
                        subtitle='Get assistance with your account and settings'
                    />
                    <SettingsLink
                        to='/sign-out'
                        title='Sign Out'
                        subtitle='Sign out of your account'
                    />
                </div>
            </div>
        </Layout>
    );
}

type SettingsLinkProps = {
    to: string;
    title: string;
    subtitle: string;
};

function SettingsLink({ to, title, subtitle }: SettingsLinkProps) {
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
