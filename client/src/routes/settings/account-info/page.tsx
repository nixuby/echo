import Layout from '@/components/layout/layout';
import SettingsLink from '../settings-link';
import { useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';
import TitleBar from '@/components/layout/titlebar';
import { t } from '@/i18next';

export default function AccountInfoPage() {
    const user = useAppSelector((s) => s.auth.user)!;

    return (
        <ProtectedRoute>
            <Layout title={t('settings.label')}>
                <div className='flex flex-col'>
                    <TitleBar>{t('settings.account-info.label')}</TitleBar>
                    <div className='flex flex-col border-b border-gray-800'>
                        <SettingsLink
                            to='/settings/account-info/name'
                            title={t('settings.change-name.label')}
                            subtitle={t('settings.change-name.subtitle')}
                        />
                        <SettingsLink
                            to='/settings/account-info/username'
                            title={t('settings.change-username.label')}
                            subtitle={t('settings.change-username.subtitle')}
                        />
                        <SettingsLink
                            to='/settings/account-info/email'
                            title={
                                user?.email
                                    ? t('settings.change-email.label')
                                    : t('settings.set-email.label')
                            }
                            subtitle={
                                user?.email
                                    ? t('settings.change-email.subtitle')
                                    : t('settings.set-email.subtitle')
                            }
                        />
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
