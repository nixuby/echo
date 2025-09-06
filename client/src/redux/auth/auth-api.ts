import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type User } from '@shared/types';

type ApiResponse<T> =
    | {
          ok: true;
          data: T;
      }
    | {
          ok: false;
          data: { errors: Record<string, string> };
      };

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5179/api/auth/',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        me: builder.query<ApiResponse<{ user: User }>, void>({
            query: () => 'me',
        }),

        signIn: builder.mutation<
            ApiResponse<{ user: User }>,
            { username: string; password: string }
        >({
            query: (body) => ({ url: 'sign-in', method: 'POST', body }),
        }),

        createAccount: builder.mutation<
            ApiResponse<{ user: User }>,
            {
                username: string;
                password: string;
                confirm: string;
                tos: boolean;
            }
        >({
            query: (body) => ({ url: 'create-account', method: 'POST', body }),
        }),

        signOut: builder.mutation<ApiResponse<null>, void>({
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
