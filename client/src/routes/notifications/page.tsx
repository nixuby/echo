import Layout from '@/components/layout/layout';
import ProtectedRoute from '@/components/protected-route';
import { useGetNotificationsInfiniteQuery } from '@/redux/user/users-api';
import Notification from './Notification';
import { useEffect, useRef } from 'react';
import TitleBar from '@/components/layout/titlebar';

export default function NotificationsPage() {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { data, fetchNextPage, hasNextPage, isFetching } =
        useGetNotificationsInfiniteQuery();

    const notifications = data ? data.pages.flat() : [];

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetching) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [isFetching]);

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
                {hasNextPage ? (
                    <div
                        ref={loadMoreRef}
                        className='flex h-36 items-center justify-center pb-16'
                    >
                        <img
                            src='/echo.svg'
                            alt='Logo'
                            className='size-12 animate-pulse'
                        />
                    </div>
                ) : (
                    <div className='h-16' />
                )}
            </Layout>
        </ProtectedRoute>
    );
}
