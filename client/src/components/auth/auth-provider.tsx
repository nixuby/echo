import { useEffect } from 'react';
import { useMeQuery } from '../../redux/auth/auth-api';
import { setUser } from '../../redux/auth/auth-slice';
import { useAppDispatch } from '../../redux/hooks';

export default function AuthProvider() {
    const { data, isSuccess } = useMeQuery();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isSuccess) {
            dispatch(setUser(data.user));
        }
    }, [data, dispatch]);

    return null;
}
