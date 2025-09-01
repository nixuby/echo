import { createBrowserRouter } from 'react-router';
import SignInRoute from './routes/signin';
import RootRoute from './routes/root';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootRoute,
    },
    {
        path: 'signin',
        Component: SignInRoute,
    },
]);

export default router;
