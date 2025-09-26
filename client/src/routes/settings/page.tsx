import ProtectedRoute from '@/components/protected-route';
import Layout from '../../components/layout/layout';
import SettingsLink from './settings-link';
import SettingsPageEmailInfo from './email-info';
import TitleBar from '@/components/layout/titlebar';
import { t } from '@/i18next';

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <Layout title={t('settings.label')}>
                <div className='flex flex-col'>
                    <TitleBar>{t('settings.label')}</TitleBar>
                    <div className='flex flex-col border-b border-gray-800'>
                        <SettingsPageEmailInfo />
                        <SettingsLink
                            to='/settings/account-info'
                            title={t('settings.account-info.label')}
                            subtitle={t('settings.account-info.subtitle')}
                        />
                        <SettingsLink
                            to='/settings/change-password'
                            title={t('settings.change-password.label')}
                            subtitle={t('settings.change-password.subtitle')}
                        />
                        <SettingsLink
                            to='/settings/notifications'
                            title={t('settings.notifications.label')}
                            subtitle={t('settings.notifications.subtitle')}
                        />
                        <SettingsLink
                            to='/settings/language'
                            title={t('settings.language.label')}
                            subtitle={t('settings.language.subtitle')}
                        />
                        <SettingsLink
                            to='/help'
                            title={t('settings.help.label')}
                            subtitle={t('settings.help.subtitle')}
                        />
                        <SettingsLink
                            to='/sign-out'
                            title={t('settings.sign-out.label')}
                            subtitle={t('settings.sign-out.subtitle')}
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
