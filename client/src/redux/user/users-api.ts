import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { OtherClientUser } from '@shared/types';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/users`,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        // Get user info
        getUser: builder.query<OtherClientUser, string>({
            query: (id) => `/@${id}`,
        }),

        updateProfilePicture: builder.mutation<void, string>({
            query: (base64) => ({
                url: '/pic',
                method: 'POST',
                body: { picture: base64 },
            }),
        }),
    }),
});

export const { useGetUserQuery, useUpdateProfilePictureMutation } = usersApi;
