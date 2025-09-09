import Layout from '@/components/layout/layout';
import SettingsLink from '../settings-link';
import { useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';
import TitleBar from '@/components/layout/titlebar';

export default function AccountInfoPage() {
    const user = useAppSelector((s) => s.auth.user)!;

    return (
        <ProtectedRoute>
            <Layout title='Settings / Account Information'>
                <div className='flex flex-col'>
                    <TitleBar>Account Information</TitleBar>
                    <div className='flex flex-col border-b border-gray-800'>
                        <SettingsLink
                            to='/settings/account-info/name'
                            title='Change Name'
                            subtitle='Update your display name'
                        />
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
