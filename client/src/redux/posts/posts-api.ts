import env from '@/env';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import {
    createApi,
    fetchBaseQuery,
    type RootState,
} from '@reduxjs/toolkit/query/react';
import type { Post } from '@shared/types';

type SortType = 'newest' | 'oldest' | 'likes';

type FeedQueryParams =
    | {
          type: 'home';
          page?: number;
          sort?: SortType;
      }
    | {
          type: 'profile';
          username: string;
          page?: number;
          sort?: SortType;
      }
    | {
          type: 'reply';
          parentId: string;
          page?: number;
          sort?: SortType;
      };

async function updatePostQueryData(
    id: string,
    dispatch: ThunkDispatch<any, any, UnknownAction>,
    queryFulfilled: Promise<any>,
    getState: () => RootState<any, any, 'postsApi'>,
    callback: (draft: Post, remove: (post: Post) => void) => void,
) {
    const feedEntries = postsApi.util.selectInvalidatedBy(getState(), [
        { type: 'PostFeed' },
    ]);

    const patches = feedEntries.map(({ originalArgs }) =>
        dispatch(
            postsApi.util.updateQueryData(
                'getPostFeed',
                originalArgs,
                (draft) => {
                    const removeList: Array<Post> = [];

                    function remove(post: Post) {
                        removeList.push(post);
                    }

                    for (const post of draft) {
                        if (
                            post && post.type === 'REPOST'
                                ? post.parent?.id === id
                                : post.id === id
                        ) {
                            callback(post, remove);
                        }
                    }

                    // remove posts marked for removal
                    for (const post of removeList) {
                        const index = draft.indexOf(post);
                        if (index !== -1) draft.splice(index, 1);
                    }
                },
            ),
        ),
    );

    // patch single post query if open
    const patchSingle = dispatch(
        postsApi.util.updateQueryData('getPost', id, (draft) => {
            callback(draft, () => {});
        }),
    );

    try {
        await queryFulfilled;
    } catch {
        patches.forEach((patch) => patch.undo());
        patchSingle.undo();
    }
}

export const postsApi = createApi({
    reducerPath: 'postsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${env.API_URL}/posts`,
        credentials: 'include',
    }),
    tagTypes: ['PostFeed', 'Post'],
    endpoints: (builder) => ({
        getPostFeed: builder.query<Array<Post>, FeedQueryParams>({
            query: (params) => ({
                url: '/feed',
                params,
            }),
            providesTags: ['PostFeed'],
        }),

        getPost: builder.query<Post, string>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),

        publishPost: builder.mutation<
            Post,
            { content: string; parentId?: string }
        >({
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
                await updatePostQueryData(
                    id,
                    dispatch,
                    queryFulfilled,
                    getState,
                    (draft) => {
                        const originalPost =
                            draft.type === 'REPOST' ? draft.parent : draft;
                        if (!originalPost) return;

                        if (originalPost.likedByMe) {
                            originalPost.likedByMe = false;
                            originalPost.likeCount -= 1;
                        } else {
                            originalPost.likedByMe = true;
                            originalPost.likeCount += 1;
                        }
                    },
                );
            },
        }),

        repostPost: builder.mutation<
            { repostCount: number; repostedByMe: boolean },
            { id: string }
        >({
            query: ({ id }) => ({
                url: `/${id}/repost`,
                method: 'POST',
            }),
            async onQueryStarted(
                { id },
                { dispatch, queryFulfilled, getState },
            ) {
                await updatePostQueryData(
                    id,
                    dispatch,
                    queryFulfilled,
                    getState,
                    (draft, remove) => {
                        const originalPost =
                            draft.type === 'REPOST' ? draft.parent : draft;
                        if (!originalPost) return;

                        if (originalPost.repostedByMe) {
                            originalPost.repostedByMe = false;
                            originalPost.repostCount -= 1;
                            remove(draft);
                        } else {
                            originalPost.repostedByMe = true;
                            originalPost.repostCount += 1;
                        }
                    },
                );
            },
            invalidatesTags: ['PostFeed'],
        }),
    }),
});

export const {
    useGetPostFeedQuery,
    useGetPostQuery,
    usePublishPostMutation,
    useLikePostMutation,
    useRepostPostMutation,
} = postsApi;
