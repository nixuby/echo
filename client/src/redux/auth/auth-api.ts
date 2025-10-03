import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ClientUser } from '@shared/types';
import { postsApi } from '../posts/posts-api';
import { usersApi } from '../user/users-api';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/auth/`,
        credentials: 'include',
    }),
    tagTypes: ['Me'],
    endpoints: (builder) => ({
        me: builder.query<{ user: ClientUser }, void>({
            query: () => 'me',
            providesTags: ['Me'],
        }),

        signIn: builder.mutation<
            { user: ClientUser },
            { username: string; password: string }
        >({
            query: (body) => ({ url: 'sign-in', method: 'POST', body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        postsApi.util.invalidateTags(['PostFeed', 'Post']),
                    );
                    dispatch(
                        usersApi.util.invalidateTags(['User', 'Notifications']),
                    );
                } catch {}
            },
            invalidatesTags: ['Me'],
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
            invalidatesTags: ['Me'],
        }),

        signOut: builder.mutation<null, void>({
            query: () => ({ url: 'sign-out', method: 'POST' }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        postsApi.util.invalidateTags(['PostFeed', 'Post']),
                    );
                    dispatch(
                        usersApi.util.invalidateTags(['User', 'Notifications']),
                    );
                } catch {}
            },
            invalidatesTags: ['Me'],
        }),

        getOAuthProfileInfo: builder.query<
            {
                uid: string;
                name: string;
                picture: string;
                exists: boolean;
            },
            { provider: string; accessToken: string }
        >({
            query: ({ provider, accessToken }) => ({
                url: `oauth/${provider}/profile-info`,
                method: 'GET',
                params: { accessToken },
            }),
        }),

        oauthSignIn: builder.mutation<
            { user: ClientUser },
            { provider: string; accessToken: string; username?: string }
        >({
            query: ({ provider, accessToken, username }) => ({
                url: `oauth/${provider}/sign-in`,
                method: 'POST',
                body: { accessToken, username },
            }),
            invalidatesTags: ['Me'],
        }),
    }),
});

export const {
    useMeQuery,
    useSignInMutation,
    useCreateAccountMutation,
    useSignOutMutation,
    useGetOAuthProfileInfoQuery,
    useOauthSignInMutation,
} = authApi;
