import { createBrowserRouter } from 'react-router';
import SignInPage from './(auth)/sign-in/page';
import HomePage from './page';
import CreateAccountPage from './(auth)/create-account/page';
import Error404Page from './error404';
import PostPage from './post/[id]/page';
import SettingsPage from './settings/page';
import SignOutPage from './(auth)/sign-out/page';
import AccountInfoPage from './settings/account-info/page';
import UsernamePage from './settings/account-info/username/page';
import EmailPage from './settings/account-info/email/page';
import NamePage from './settings/account-info/name/page';

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
        path: 'settings/account-info',
        Component: AccountInfoPage,
    },
    {
        path: 'settings/account-info/name',
        Component: NamePage,
    },
    {
        path: 'settings/account-info/username',
        Component: UsernamePage,
    },
    {
        path: 'settings/account-info/email',
        Component: EmailPage,
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
