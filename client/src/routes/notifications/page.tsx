import Layout from '@/components/layout/layout';
import ProtectedRoute from '@/components/protected-route';
import { useGetNotificationsInfiniteQuery } from '@/redux/user/users-api';
import Notification from './Notification';
import { useEffect, useRef } from 'react';
import isElementInViewport from '@/util/is-element-in-viewport';
import TitleBar from '@/components/layout/titlebar';

export default function NotificationsPage() {
    const ref = useRef<HTMLDivElement>(null);
    const { data, fetchNextPage, hasNextPage } =
        useGetNotificationsInfiniteQuery();

    const notifications = data ? data.pages.flat() : [];

    function handleUpdate() {
        if (ref.current && isElementInViewport(ref.current) && hasNextPage) {
            fetchNextPage();
        }
    }

    useEffect(() => {
        if (ref.current && hasNextPage) {
            handleUpdate();
            window.addEventListener('scroll', handleUpdate);
            return () => window.removeEventListener('scroll', handleUpdate);
        }
    }, [ref.current, hasNextPage]);

    return (
        <ProtectedRoute>
            <Layout title='Notifications'>
                <div className='flex flex-col'>
                    <TitleBar>Notification</TitleBar>
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            notification={notification}
                        />
                    ))}
                </div>
                {hasNextPage && <div ref={ref} className='h-20' />}
            </Layout>
        </ProtectedRoute>
    );
}
