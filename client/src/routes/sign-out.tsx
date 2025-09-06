import { useSignOutMutation } from '../redux/auth/auth-api';
import AuthLayout from '../components/auth/auth-layout';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../redux/hooks';
import { setUser } from '../redux/auth/auth-slice';

export default function SignOutRoute() {
    const navigate = useNavigate();
    const [signOut] = useSignOutMutation();
    const dispatch = useAppDispatch();

    useEffect(() => {
        signOut()
            .unwrap()
            .then(() => {
                dispatch(setUser(null));
            })
            .finally(() => {
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            });
    }, []);

    return (
        <AuthLayout noclose title='Signing Out...'>
            Signing out, please wait...
        </AuthLayout>
    );
}
