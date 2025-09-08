import { useGetPostFeedQuery } from '@/redux/posts/posts-api';
import PostFeed from './post-feed';

export default function HomePostFeed() {
    const { data } = useGetPostFeedQuery({ page: 1 });
    return <PostFeed posts={data} />;
}
