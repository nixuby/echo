import { createBrowserRouter } from 'react-router';
import SignInRoute from './routes/sign-in';
import RootRoute from './routes/root';
import CreateAccountRoute from './routes/create-account';
import Error404Route from './routes/error404';
import PostRoute from './routes/post';

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
    {
        path: 'post/:id',
        Component: PostRoute,
    },
    {
        path: '*',
        Component: Error404Route,
    },
]);

export default router;
