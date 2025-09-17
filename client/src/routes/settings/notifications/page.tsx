import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import ProtectedRoute from '@/components/protected-route';
import {
    useGetNotificationSettingsQuery,
    useToggleNotificationSettingMutation,
} from '@/redux/user/users-api';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { NOTIFICATION_TYPES, type NotificationType } from '@shared/types';

const notificationNames: Record<NotificationType, string> = {
    post_shared: 'Post shared',
    post_replied: 'Post replied',
    post_liked: 'Post liked',
    new_follower: 'New follower',
};

export default function NotificationsSettingsPage() {
    const { data: settings } = useGetNotificationSettingsQuery();
    const [toggleNotificationSetting] = useToggleNotificationSettingMutation();

    function handleClick(ev: React.MouseEvent<HTMLButtonElement>) {
        const type = ev.currentTarget.dataset.type as NotificationType;
        if (!type && !NOTIFICATION_TYPES.includes(type)) return;
        toggleNotificationSetting(type);
    }

    return (
        <ProtectedRoute>
            <Layout title='Settings / Notifications'>
                <div className='flex flex-col'>
                    <TitleBar>Notification Settings</TitleBar>
                    {settings &&
                        (
                            Object.keys(
                                notificationNames,
                            ) as Array<NotificationType>
                        ).map((type) => (
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
                                <span>{notificationNames[type]}</span>
                            </button>
                        ))}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
