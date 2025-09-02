import { createBrowserRouter } from 'react-router';
import SignInRoute from './routes/sign-in';
import RootRoute from './routes/root';
import CreateAccountRoute from './routes/create-account';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootRoute,
    },
    {
        path: 'sign-in',
        Component: SignInRoute,
    },
    {
        path: 'create-account',
        Component: CreateAccountRoute,
    },
]);

export default router;
