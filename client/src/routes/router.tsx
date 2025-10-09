import { createBrowserRouter } from 'react-router';
import React from 'react';

const SignInPage = React.lazy(() => import('./(auth)/sign-in/page'));
const HomePage = React.lazy(() => import('./page'));
const CreateAccountPage = React.lazy(
    () => import('./(auth)/create-account/page'),
);
const Error404Page = React.lazy(() => import('./error404'));
const PostPage = React.lazy(() => import('./post/[id]/page'));
const SettingsPage = React.lazy(() => import('./settings/page'));
const SignOutPage = React.lazy(() => import('./(auth)/sign-out/page'));
const AccountInfoPage = React.lazy(
    () => import('./settings/account-info/page'),
);
const UsernamePage = React.lazy(
    () => import('./settings/account-info/username/page'),
);
const EmailPage = React.lazy(
    () => import('./settings/account-info/email/page'),
);
const NamePage = React.lazy(() => import('./settings/account-info/name/page'));
const UserProfilePage = React.lazy(() => import('./[id]/page'));
const NotificationsPage = React.lazy(() => import('./notifications/page'));
const NotificationsSettingsPage = React.lazy(
    () => import('./settings/notifications/page'),
);
const MessagePage = React.lazy(() => import('./message/page'));
const NewChatPage = React.lazy(() => import('./message/new/page'));
const ChatPage = React.lazy(() => import('./chat/[id]'));
const RootLayout = React.lazy(() => import('./root-layout'));
const VerifyEmailPage = React.lazy(() => import('./verify-email/[token]/page'));
const LanguagePage = React.lazy(() => import('./settings/language/page'));
const GoogleOAuthPage = React.lazy(() => import('./(auth)/oauth/google/page'));
const TosPage = React.lazy(() => import('./(info)/tos/page'));
const PrivacyPolicyPage = React.lazy(() => import('./(info)/privacy/page'));
const ChangePasswordPage = React.lazy(
    () => import('./settings/change-password/page'),
);
const RequestResetPasswordPage = React.lazy(
    () => import('./(auth)/reset-password/page'),
);
const ResetPasswordPage = React.lazy(
    () => import('./(auth)/reset-password/[token]/page'),
);
const SavedPostsPage = React.lazy(() => import('./saved/page'));

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
                path: 'reset-password',
                Component: RequestResetPasswordPage,
            },
            {
                path: 'reset-password/:token',
                Component: ResetPasswordPage,
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
                path: 'settings/change-password',
                Component: ChangePasswordPage,
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
                path: 'saved',
                Component: SavedPostsPage,
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
