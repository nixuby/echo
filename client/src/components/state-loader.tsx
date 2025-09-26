import { useEffect, useState } from 'react';
import { useMeQuery } from '@/redux/auth/auth-api';
import { setUser } from '@/redux/auth/auth-slice';
import { useAppDispatch } from '@/redux/hooks';
import { initalizeI18next } from '@/i18next';

export type StateLoaderProps = {
    children?: React.ReactNode;
};

// Fetch state from the server
export default function StateLoader({ children }: StateLoaderProps) {
    const LANG = 'en'; // TODO: load from state

    const [isEverythingLoaded, setIsEverythingLoaded] = useState(false);

    const meQuery = useMeQuery();
    const dispatch = useAppDispatch();

    useEffect(() => {
        initalizeI18next(LANG);
    });

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
        return (
            <div className='_bg-pattern-wave flex h-full min-h-screen flex-col items-center justify-center bg-gray-950 text-white'>
                <img
                    src='/echo.svg'
                    alt='Logo'
                    className='size-12 animate-pulse'
                />
            </div>
        );
    }

    return (
        <>
            <html lang={LANG} />
            {children}
        </>
    );
}
