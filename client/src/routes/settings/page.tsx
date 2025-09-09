import ProtectedRoute from '@/components/protected-route';
import Layout from '../../components/layout/layout';
import SettingsLink from './settings-link';
import SettingsPageEmailInfo from './email-info';
import TitleBar from '@/components/layout/titlebar';

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <Layout title='Settings'>
                <div className='flex flex-col'>
                    <TitleBar>Settings</TitleBar>
                    <div className='flex flex-col border-b border-gray-800'>
                        <SettingsPageEmailInfo />
                        <SettingsLink
                            to='/settings/account-info'
                            title='Account Information'
                            subtitle='Manage your account information like name, username, and email'
                        />
                        <SettingsLink
                            to='/settings/change-password'
                            title='Change Password'
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
        </ProtectedRoute>
    );
}
