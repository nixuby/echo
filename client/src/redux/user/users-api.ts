import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { OtherClientUser } from '@shared/types';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5179/api/users',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        // Get user info
        getUser: builder.query<OtherClientUser, string>({
            query: (id) => `/@${id}`,
        }),
    }),
});

export const { useGetUserQuery } = usersApi;
