import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ClientNotification, OtherClientUser } from '@shared/types';
import { authApi } from '../auth/auth-api';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/users`,
        credentials: 'include',
    }),
    tagTypes: ['User', 'Notifications'],
    endpoints: (builder) => ({
        // Get user info
        getUser: builder.query<OtherClientUser, string>({
            query: (id) => `/${id}`,
            providesTags: ['User'],
        }),

        updateProfilePicture: builder.mutation<void, string>({
            query: (base64) => ({
                url: '/pic',
                method: 'POST',
                body: { picture: base64 },
            }),
        }),

        updateBio: builder.mutation<void, string>({
            query: (bio) => ({
                url: '/bio',
                method: 'POST',
                body: { bio },
            }),
            invalidatesTags: ['User'],
        }),

        getNotifications: builder.infiniteQuery<
            Array<ClientNotification>,
            void,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage, _allPages, lastPageParam) =>
                    lastPage.length === 10 ? lastPageParam + 1 : null,
                getPreviousPageParam: (
                    _firstPage,
                    _allPages,
                    firstPageParam,
                ) => (firstPageParam > 0 ? firstPageParam - 1 : undefined),
            },
            query: ({ pageParam }) => ({
                url: '/notifications',
                params: { page: pageParam },
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                await queryFulfilled;
                dispatch(authApi.util.invalidateTags(['Me']));
            },
            providesTags: ['Notifications'],
        }),
    }),
});

export const {
    useGetUserQuery,
    useUpdateProfilePictureMutation,
    useUpdateBioMutation,
    useGetNotificationsInfiniteQuery,
} = usersApi;
