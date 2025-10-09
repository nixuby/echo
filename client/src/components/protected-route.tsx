import { useAppSelector } from '@/redux/hooks';
import { Navigate } from 'react-router';
import Layout from './layout/layout';

export default function protectedRoute(component: () => React.ReactNode) {
    const user = useAppSelector((s) => s.auth.user);

    if (!user) {
        console.warn('Protected route');
        return (
            <Layout>
                <Navigate
                    replace
                    to={`/sign-in?redirectTo=${window.location.pathname}`}
                />
            </Layout>
        );
    }

    return component();
}
