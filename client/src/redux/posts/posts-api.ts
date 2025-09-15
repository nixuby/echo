import env from '@/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post } from '@shared/types';

export const postsApi = createApi({
    reducerPath: 'postsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/posts`,
        credentials: 'include',
    }),
    tagTypes: ['PostFeed'],
    endpoints: (builder) => ({
        getPostFeed: builder.query<
            Array<Post>,
            { page?: number; username?: string }
        >({
            query: (params) => ({
                url: '/feed',
                params,
            }),
            providesTags: ['PostFeed'],
        }),

        getPost: builder.query<Post, string>({
            query: (id) => `/${id}`,
        }),

        publishPost: builder.mutation<Post, { content: string }>({
            query: (body) => ({
                url: '/publish',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PostFeed'],
        }),

        likePost: builder.mutation<
            { likeCount: number; likedByMe: boolean },
            { id: string }
        >({
            query: ({ id }) => ({
                url: `/${id}/like`,
                method: 'POST',
            }),
            async onQueryStarted(
                { id },
                { dispatch, queryFulfilled, getState },
            ) {
                const feedEntries = postsApi.util.selectInvalidatedBy(
                    getState(),
                    [{ type: 'PostFeed' }],
                );

                const patches = feedEntries.map(({ originalArgs }) =>
                    dispatch(
                        postsApi.util.updateQueryData(
                            'getPostFeed',
                            originalArgs,
                            (draft) => {
                                const post = draft.find(
                                    (post) => post.id === id,
                                );
                                if (post) {
                                    if (post.likedByMe) {
                                        post.likedByMe = false;
                                        post.likeCount -= 1;
                                    } else {
                                        post.likedByMe = true;
                                        post.likeCount += 1;
                                    }
                                }
                            },
                        ),
                    ),
                );

                // patch single post query if open
                const patchSingle = dispatch(
                    postsApi.util.updateQueryData('getPost', id, (draft) => {
                        if (draft.likedByMe) {
                            draft.likedByMe = false;
                            draft.likeCount -= 1;
                        } else {
                            draft.likedByMe = true;
                            draft.likeCount += 1;
                        }
                    }),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach((patch) => patch.undo());
                    patchSingle.undo();
                }
            },
        }),
    }),
});

export const {
    useGetPostFeedQuery,
    useGetPostQuery,
    usePublishPostMutation,
    useLikePostMutation,
} = postsApi;
