import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ClientUser } from '@shared/types';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/auth/`,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        me: builder.query<{ user: ClientUser }, void>({
            query: () => 'me',
        }),

        signIn: builder.mutation<
            { user: ClientUser },
            { username: string; password: string }
        >({
            query: (body) => ({ url: 'sign-in', method: 'POST', body }),
        }),

        createAccount: builder.mutation<
            { user: ClientUser },
            {
                username: string;
                password: string;
                confirm: string;
                tos: boolean;
            }
        >({
            query: (body) => ({ url: 'create-account', method: 'POST', body }),
        }),

        signOut: builder.mutation<null, void>({
            query: () => ({ url: 'sign-out', method: 'POST' }),
        }),
    }),
});

export const {
    useMeQuery,
    useSignInMutation,
    useCreateAccountMutation,
    useSignOutMutation,
} = authApi;
