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
import UserProfilePage from './[id]/page';
import NotificationsPage from './notifications/page';
import NotificationsSettingsPage from './settings/notifications/page';
import MessagePage from './message/page';
import NewChatPage from './message/new/page';
import ChatPage from './chat/[id]';
import RootLayout from './root-layout';
import VerifyEmailPage from './verify-email/[token]/page';
import LanguagePage from './settings/language/page';
import GoogleOAuthPage from './(auth)/oauth/google/page';
import TosPage from './(info)/tos/page';
import PrivacyPolicyPage from './(info)/privacy/page';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayout,
        children: [
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
                path: 'oauth/google',
                Component: GoogleOAuthPage,
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
                path: 'settings/language',
                Component: LanguagePage,
            },
            {
                path: 'settings/notifications',
                Component: NotificationsSettingsPage,
            },
            {
                path: 'notifications',
                Component: NotificationsPage,
            },
            {
                path: 'message',
                Component: MessagePage,
            },
            {
                path: 'message/new',
                Component: NewChatPage,
            },
            {
                path: 'chat/:id',
                Component: ChatPage,
            },
            {
                path: 'post/:id',
                Component: PostPage,
            },
            {
                path: 'verify-email/:token',
                Component: VerifyEmailPage,
            },
            {
                path: 'tos',
                Component: TosPage,
            },
            {
                path: 'privacy',
                Component: PrivacyPolicyPage,
            },
            {
                path: ':id',
                Component: UserProfilePage,
            },
            {
                path: '*',
                Component: Error404Page,
            },
        ],
    },
]);

export default router;
