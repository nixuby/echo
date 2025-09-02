import { createBrowserRouter } from 'react-router';
import SignInRoute from './routes/signin';
import RootRoute from './routes/root';
import CreateAccountRoute from './routes/create-account';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootRoute,
    },
    {
        path: 'signin',
        Component: SignInRoute,
    },
    {
        path: 'create-account',
        Component: CreateAccountRoute,
    },
]);

export default router;
