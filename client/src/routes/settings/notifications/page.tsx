import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import protectedRoute from '@/components/protected-route';
import { t } from '@/i18next';
import {
    useGetNotificationSettingsQuery,
    useToggleNotificationSettingMutation,
} from '@/redux/user/users-api';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { NOTIFICATION_TYPES, type NotificationType } from '@shared/types';

export default function NotificationsSettingsPage() {
    return protectedRoute(() => {
        const { data: settings } = useGetNotificationSettingsQuery();
        const [toggleNotificationSetting] =
            useToggleNotificationSettingMutation();

        function handleClick(ev: React.MouseEvent<HTMLButtonElement>) {
            const type = ev.currentTarget.dataset.type as NotificationType;
            if (!type && !NOTIFICATION_TYPES.includes(type)) return;
            toggleNotificationSetting(type);
        }

        return (
            <Layout title={t('settings.notifications.label')}>
                <div className='flex flex-col'>
                    <TitleBar>{t('settings.notifications.label')}</TitleBar>
                    {settings &&
                        NOTIFICATION_TYPES.map((type) => (
                            <button
                                key={type}
                                data-type={type}
                                onClick={handleClick}
                                className='flex cursor-pointer items-center gap-4 border-b border-gray-800 bg-gray-950 px-4 py-2 transition hover:bg-gray-900'
                            >
                                <span>
                                    {settings[type] ? (
                                        <CheckIcon className='size-4' />
                                    ) : (
                                        <XMarkIcon className='size-4' />
                                    )}
                                </span>
                                <span>
                                    {t(`notifications.types.${type}.name`)}
                                </span>
                            </button>
                        ))}
                </div>
            </Layout>
        );
    });
}
