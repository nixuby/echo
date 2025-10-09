import {
    useGetPostFeedInfiniteQuery,
    type FeedQueryParams,
} from '@/redux/posts/posts-api';
import Post from './post';
import { useEffect, useRef } from 'react';

export type PostFeedProps = {
    query: FeedQueryParams;
};

export default function PostFeed({ query }: PostFeedProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { data, fetchNextPage, hasNextPage, isFetching } =
        useGetPostFeedInfiniteQuery(query);
    const posts = data ? data.pages.flat() : [];

    console.log(posts);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetching) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [isFetching]);

    return (
        <div className='flex flex-col'>
            {posts &&
                posts.map((post) => <Post key={post.id} short post={post} />)}
            {hasNextPage ? (
                <div
                    ref={loadMoreRef}
                    className='flex h-36 items-center justify-center pb-16'
                >
                    <img
                        src='/echo.svg'
                        alt='Logo'
                        className='size-12 animate-pulse'
                    />
                </div>
            ) : (
                <div className='h-16' />
            )}
        </div>
    );
}
