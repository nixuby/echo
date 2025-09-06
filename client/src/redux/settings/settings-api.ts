import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '@shared/types';

export const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5179/api/settings',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        changeUsername: builder.mutation<
            {
                user: User;
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

        changeEmail: builder.mutation<{ user: User }, { email: string | null }>(
            {
                query: (payload) => ({
                    url: '/email',
                    method: 'POST',
                    body: payload,
                }),
            },
        ),

        resendVerificationEmail: builder.mutation<void, void>({
            query: () => ({
                url: '/email/resend-verification',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useChangeUsernameMutation,
    useChangeEmailMutation,
    useResendVerificationEmailMutation,
} = settingsApi;
