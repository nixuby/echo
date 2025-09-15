import { useGetPostFeedQuery } from '@/redux/posts/posts-api';
import PostFeed from './post-feed';

export type RepliesPostFeedProps = {
    postId: string;
};

export default function RepliesPostFeed({ postId }: RepliesPostFeedProps) {
    const { data } = useGetPostFeedQuery({ page: 1, parentPostId: postId });
    return <PostFeed posts={data} />;
}
