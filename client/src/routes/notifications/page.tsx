import Layout from '@/components/layout/layout';
import ProtectedRoute from '@/components/protected-route';
import { useGetNotificationsInfiniteQuery } from '@/redux/user/users-api';
import Notification from './Notification';
import { useEffect, useRef } from 'react';

function isElementInViewport(el: HTMLElement): boolean {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
            (window.innerWidth || document.documentElement.clientWidth)
    );
}

export default function NotificationsPage() {
    const ref = useRef<HTMLDivElement>(null);
    const { data, fetchNextPage, hasNextPage } =
        useGetNotificationsInfiniteQuery();

    const notifications = data ? data.pages.flat() : [];

    function handleUpdate() {
        console.log(ref.current);

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
