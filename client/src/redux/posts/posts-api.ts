import env from '@/env';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import {
    createApi,
    fetchBaseQuery,
    type RootState,
} from '@reduxjs/toolkit/query/react';
import type { Post } from '@shared/types';

type SortType = 'newest' | 'oldest' | 'likes';

export type FeedQueryParams =
    | {
          type: 'home';
          sort?: SortType;
      }
    | {
          type: 'profile';
          username: string;
          sort?: SortType;
      }
    | {
          type: 'reply';
          parentId: string;
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
                    const removeList: Array<[page: number, index: number]> = [];

                    function remove(post: Post) {
                        const page = draft.pages.findIndex((p) =>
                            p.find((x) => x.id === post.id),
                        );
                        if (page === -1) return;
                        const index = draft.pages[page].findIndex(
                            (x) => x.id === post.id,
                        );
                        if (index === -1) return;
                        removeList.push([page, index]);
                    }

                    for (const page of draft.pages) {
                        for (const post of page) {
                            if (
                                post && post.type === 'REPOST'
                                    ? post.parent?.id === id
                                    : post.id === id
                            ) {
                                callback(post, remove);
                            }
                        }
                    }

                    // remove posts marked for removal
                    for (const [page, index] of removeList) {
                        draft.pages[page].splice(index, 1);
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
        getPostFeed: builder.infiniteQuery<
            Array<Post>,
            FeedQueryParams,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
                    lastPageParam + 1,
                getPreviousPageParam: (
                    _firstPage,
                    _allPages,
                    firstPageParam,
                ) => (firstPageParam > 0 ? firstPageParam - 1 : undefined),
            },

            query: ({ pageParam, queryArg }) => ({
                url: '/feed',
                params: {
                    page: pageParam,
                    ...queryArg,
                },
            }),
            providesTags: ['PostFeed'],
        }),

        getPost: builder.query<Post, string>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),

        publishPost: builder.mutation<
            Post,
            { content: string; attachments: Array<string>; parentId?: string }
        >({
            query: (body) => ({
                url: '/publish',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PostFeed', 'Post'],
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
                            if (draft.type === 'REPOST') remove(draft);
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
    useGetPostFeedInfiniteQuery,
    useGetPostQuery,
    usePublishPostMutation,
    useLikePostMutation,
    useRepostPostMutation,
} = postsApi;
