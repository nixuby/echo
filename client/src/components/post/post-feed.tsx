import {
    useGetPostFeedInfiniteQuery,
    type FeedQueryParams,
} from '@/redux/posts/posts-api';
import Post from './post';
import { useEffect, useRef } from 'react';
import isElementInViewport from '@/util/is-element-in-viewport';

export type PostFeedProps = {
    query: FeedQueryParams;
};

export default function PostFeed({ query }: PostFeedProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { data, fetchNextPage, hasNextPage } =
        useGetPostFeedInfiniteQuery(query);
    const posts = data ? data.pages.flat() : [];

    function handleUpdate() {
        if (ref.current && isElementInViewport(ref.current) && hasNextPage) {
            fetchNextPage();
        }
    }

    useEffect(() => {
        if (ref.current && hasNextPage) {
            handleUpdate();
            window.addEventListener('scroll', handleUpdate);
            return () => window.removeEventListener('scroll', handleUpdate);
        }
    }, [ref.current, hasNextPage]);

    return (
        <div className='flex flex-col'>
            {posts &&
                posts.map((post) => <Post key={post.id} short post={post} />)}
            {hasNextPage && <div ref={ref} className='h-20' />}
        </div>
    );
}
