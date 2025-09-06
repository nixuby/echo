import { createBrowserRouter } from 'react-router';
import SignInPage from './(auth)/sign-in/page';
import HomePage from './page';
import CreateAccountPage from './(auth)/create-account/page';
import Error404Page from './error404';
import PostPage from './post/[id]/page';
import SettingsPage from './settings/page';
import SignOutPage from './(auth)/sign-out/page';

const router = createBrowserRouter([
    {
        path: '/',
        Component: HomePage,
    },
    {
        path: 'sign-in',
        Component: SignInPage,
    },
    {
        path: 'create-account',
        Component: CreateAccountPage,
    },
    {
        path: 'sign-out',
        Component: SignOutPage,
    },
    {
        path: 'settings',
        Component: SettingsPage,
    },
    {
        path: 'post/:id',
        Component: PostPage,
    },
    {
        path: '*',
        Component: Error404Page,
    },
]);

export default router;
