import { DialogProvider } from '@/components/dialog/dialog';
import StateLoader from '@/components/state-loader';
import { Outlet } from 'react-router';

export default function RootLayout() {
    return (
        <>
            <StateLoader>
                <DialogProvider>
                    <Outlet />
                </DialogProvider>
            </StateLoader>
        </>
    );
}
