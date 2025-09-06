import { useEffect } from 'react';
import { useMeQuery } from '../../redux/auth/auth-api';
import { setUser } from '../../redux/auth/auth-slice';
import { useAppDispatch } from '../../redux/hooks';

export default function AuthProvider() {
    const { data } = useMeQuery();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data && data.ok) {
            dispatch(setUser(data.data.user));
        }
    }, [data, dispatch]);

    return null;
}
