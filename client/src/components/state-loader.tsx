import { useEffect } from 'react';
import { useMeQuery } from '../redux/auth/auth-api';
import { setUser } from '../redux/auth/auth-slice';
import { useAppDispatch } from '../redux/hooks';

export type StateLoaderProps = {
    children?: React.ReactNode;
};

// Fetch state from the server
export default function StateLoader({ children }: StateLoaderProps) {
    const meQuery = useMeQuery();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (meQuery.isSuccess) {
            dispatch(setUser(meQuery.data.user));
        }
    }, [meQuery.data, dispatch]);

    const isEverythingLoaded = !(meQuery.isLoading || meQuery.isUninitialized);

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

    return children;
}
