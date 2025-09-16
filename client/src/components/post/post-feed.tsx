import {
    useGetPostFeedInfiniteQuery,
    type FeedQueryParams,
} from '@/redux/posts/posts-api';
import Post from './post';

export type PostFeedProps = {
    query: FeedQueryParams;
};

export default function PostFeed({ query }: PostFeedProps) {
    const { data, fetchNextPage } = useGetPostFeedInfiniteQuery(query);
    const posts = data ? data.pages.flat() : [];

    function loadNextPage() {
        fetchNextPage();
    }

    return (
        <div className='flex flex-col'>
            {posts &&
                posts.map((post) => <Post key={post.id} short post={post} />)}
            <button onClick={loadNextPage}>Load next!</button>
        </div>
    );
}
