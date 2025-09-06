import { Link } from 'react-router';
import Layout from '@/components/layout/layout';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import SettingsLink from '../settings-link';
import { useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';

export default function AccountInfoPage() {
    const user = useAppSelector((s) => s.auth.user)!;

    return (
        <ProtectedRoute>
            <Layout title='Settings / Account Information'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-2 border-b border-gray-800 px-4 py-2'>
                        <Link to='/settings'>
                            <ArrowLeftIcon className='size-5' />
                        </Link>
                        <h2 className='text-xl font-bold'>
                            Account Information
                        </h2>
                    </div>
                    <div className='flex flex-col border-b border-gray-800'>
                        <SettingsLink
                            to='/settings/account-info/username'
                            title='Change Username'
                            subtitle='Update your account username'
                        />
                        <SettingsLink
                            to='/settings/account-info/email'
                            title={user?.email ? 'Change Email' : 'Set Email'}
                            subtitle='Update your account email'
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
