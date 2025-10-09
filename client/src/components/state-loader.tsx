import { useEffect, useState } from 'react';
import { useMeQuery } from '@/redux/auth/auth-api';
import { setUser } from '@/redux/auth/auth-slice';
import { useAppDispatch } from '@/redux/hooks';
import { initalizeI18next } from '@/i18next';
import Loading from './loading';

export type StateLoaderProps = {
    children?: React.ReactNode;
};

// Fetch state from the server
export default function StateLoader({ children }: StateLoaderProps) {
    const LANG = localStorage.getItem('lang') || 'en';

    const [isEverythingLoaded, setIsEverythingLoaded] = useState(false);

    const meQuery = useMeQuery();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (meQuery.isError) {
            initalizeI18next(LANG);
        } else if (meQuery.isSuccess) {
            const lang = meQuery.data.user.language || LANG;
            initalizeI18next(lang);
            document.documentElement.lang = lang;
        }
    }, [meQuery.isSuccess, meQuery.isError, meQuery.data]);

    useEffect(() => {
        if (meQuery.isSuccess) {
            console.info('Loaded state', { user: meQuery.data.user });
            dispatch(setUser(meQuery.data.user));
        }
    }, [meQuery.data, dispatch]);

    useEffect(() => {
        setIsEverythingLoaded(!meQuery.isLoading && !meQuery.isUninitialized);
    }, [meQuery.isLoading, meQuery.isUninitialized]);

    if (!isEverythingLoaded) {
        return <Loading />;
    }

    return children;
}
