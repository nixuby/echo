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
            { user: ClientUser },
            { email: string | null }
        >({
            query: (payload) => ({
                url: '/email',
                method: 'POST',
                body: payload,
            }),
        }),

        resendVerificationEmail: builder.mutation<void, void>({
            query: () => ({
                url: '/email/resend-verification',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useChangeNameMutation,
    useChangeUsernameMutation,
    useChangeEmailMutation,
    useResendVerificationEmailMutation,
} = settingsApi;
