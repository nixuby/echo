import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ClientUser } from '@shared/types';

export const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/settings`,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        changeName: builder.mutation<{ user: ClientUser }, { name: string }>({
            query: (payload) => ({
                url: '/name',
                method: 'POST',
                body: payload,
            }),
        }),

        changeUsername: builder.mutation<
            {
                user: ClientUser;
            },
            {
                username: string;
            }
        >({
            query: (payload) => ({
                url: '/username',
                method: 'POST',
                body: payload,
            }),
        }),

        changeEmail: builder.mutation<
            { user: ClientUser; token: string },
            { email: string | null }
        >({
            query: (payload) => ({
                url: '/email',
                method: 'POST',
                body: payload,
            }),
        }),

        resendVerificationEmail: builder.mutation<{ token: string }, void>({
            query: () => ({
                url: '/email/resend-verification',
                method: 'POST',
            }),
        }),

        verifyEmail: builder.mutation<{ user: ClientUser }, { token: string }>({
            query: (payload) => ({
                url: '/email/verify',
                method: 'POST',
                body: payload,
            }),
        }),

        changePassword: builder.mutation<
            { user: ClientUser },
            { current: string; new: string; confirm: string }
        >({
            query: (payload) => ({
                url: '/password',
                method: 'POST',
                body: payload,
            }),
        }),

        changeLanguage: builder.mutation<
            { user: ClientUser },
            { language: string }
        >({
            query: (payload) => ({
                url: '/language',
                method: 'POST',
                body: payload,
            }),
        }),
    }),
});

export const {
    useChangeNameMutation,
    useChangeUsernameMutation,
    useChangeEmailMutation,
    useResendVerificationEmailMutation,
    useVerifyEmailMutation,
    useChangeLanguageMutation,
    useChangePasswordMutation,
} = settingsApi;
