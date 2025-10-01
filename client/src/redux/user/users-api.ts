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
    tagTypes: ['User', 'Notifications', 'ChatList'],
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
            providesTags: ['User', 'ChatList'],
        }),

        createChat: builder.mutation<string, string>({
            query: (username) => ({
                url: `/chat/new/${username}`,
                method: 'POST',
            }),
            invalidatesTags: ['ChatList'],
        }),

        sendMessage: builder.mutation<
            {
                id: string;
                sender: {
                    name: string | null;
                    username: string;
                    isVerified: boolean;
                };
                content: string;
                createdAt: string;
            },
            { chatId: string; content: string }
        >({
            query: ({ chatId, content }) => ({
                url: `/chat/${chatId}`,
                method: 'POST',
                body: { content },
            }),
            onQueryStarted: async (
                { chatId, content },
                { dispatch, getState, queryFulfilled },
            ) => {
                // get user
                const user = authApi.endpoints.me.select()(getState() as any)
                    .data?.user!;

                const tempId =
                    'temp-id-' + Math.random().toString(36).substring(2, 15);

                const patch = dispatch(
                    usersApi.util.updateQueryData(
                        'getMessages',
                        chatId,
                        (draft) => {
                            const needNewPage =
                                draft.pages[draft.pages.length - 1].length < 20;
                            if (needNewPage) draft.pages.unshift([]);
                            draft.pages[0].unshift({
                                id: tempId,
                                sender: {
                                    name: user.name,
                                    username: user.username,
                                    isVerified: user.isVerified,
                                },
                                content,
                                createdAt: new Date().toISOString(),
                            });
                        },
                    ),
                );

                try {
                    const res = await queryFulfilled;
                    if (res.data) {
                        dispatch(
                            usersApi.util.updateQueryData(
                                'getMessages',
                                chatId,
                                (draft) => {
                                    const msg = draft.pages
                                        .flat()
                                        .find((m) => m.id === tempId);
                                    if (msg) {
                                        msg.id = res.data.id;
                                    }
                                },
                            ),
                        );
                    }
                } catch {
                    patch.undo();
                }
            },
        }),

        getMessages: builder.infiniteQuery<
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
            string,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage, _allPages, lastPageParam) =>
                    lastPage.length === 20 ? lastPageParam + 1 : null,
            },
            query: ({ pageParam, queryArg }) => ({
                url: `/chat/${queryArg}/messages`,
                params: {
                    page: pageParam,
                },
            }),
            providesTags: (_result, _error, chatId) => [
                { type: 'User', id: chatId },
                'ChatList',
            ],
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
    useGetMessagesInfiniteQuery,
} = usersApi;
