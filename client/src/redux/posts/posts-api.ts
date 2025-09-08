import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post } from '@shared/types';

export const postsApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5179/api/posts',
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
    }),
});

export const { useGetPostFeedQuery, useGetPostQuery, usePublishPostMutation } =
    postsApi;
