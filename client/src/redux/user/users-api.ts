import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    ClientNotification,
    NotificationSettings,
    NotificationType,
    OtherClientUser,
} from '@shared/types';
import { authApi } from '../auth/auth-api';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/users`,
        credentials: 'include',
    }),
    tagTypes: ['User', 'Notifications', 'Chat'],
    endpoints: (builder) => ({
        // Get user info
        getUser: builder.query<OtherClientUser, string>({
            query: (id) => `/user/${id}`,
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

        getNotificationSettings: builder.query<NotificationSettings, void>({
            query: () => '/notification-settings',
        }),

        toggleNotificationSetting: builder.mutation<boolean, NotificationType>({
            query: (type) => ({
                url: '/notification-settings',
                method: 'POST',
                body: { type },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    usersApi.util.updateQueryData(
                        'getNotificationSettings',
                        undefined,
                        (draft) => {
                            draft[arg] = !draft[arg];
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),

        follow: builder.mutation<boolean, string>({
            query: (username) => ({
                url: `/follow/${username}`,
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),

        search: builder.query<
            Array<{
                name: string | null;
                username: string;
                isVerified: boolean;
            }>,
            string
        >({
            query: (q) => ({
                url: '/search',
                params: { q },
            }),
        }),

        getChats: builder.query<
            Array<{
                id: string;
                user: {
                    name: string | null;
                    username: string;
                    isVerified: boolean;
                };
            }>,
            void
        >({
            query: () => '/chats',
            providesTags: ['User', 'Chat'],
        }),

        createChat: builder.mutation<string, string>({
            query: (username) => ({
                url: `/chat/new/${username}`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),

        sendMessage: builder.mutation<
            void,
            { chatId: string; content: string }
        >({
            query: ({ chatId, content }) => ({
                url: `/chat/${chatId}`,
                method: 'POST',
                body: { content },
            }),
            invalidatesTags: ['Chat'],
        }),

        getMessages: builder.query<
            Array<{
                id: string;
                sender: {
                    name: string | null;
                    username: string;
                    isVerified: boolean;
                };
                content: string;
                createdAt: string;
            }>,
            string
        >({
            query: (chatId) => `/chat/${chatId}/messages`,
        }),
    }),
});

export const {
    useGetUserQuery,
    useUpdateProfilePictureMutation,
    useUpdateBioMutation,
    useGetNotificationsInfiniteQuery,
    useGetNotificationSettingsQuery,
    useToggleNotificationSettingMutation,
    useFollowMutation,
    useSearchQuery,
    useGetChatsQuery,
    useCreateChatMutation,
    useSendMessageMutation,
    useGetMessagesQuery,
} = usersApi;
