import { useGetPostFeedQuery } from '@/redux/posts/posts-api';
import PostFeed from './post-feed';

export type RepliesPostFeedProps = {
    postId: string;
};

export default function RepliesPostFeed({ postId }: RepliesPostFeedProps) {
    const { data } = useGetPostFeedQuery({
        type: 'reply',
        parentId: postId,
        page: 1,
    });
    return <PostFeed posts={data} />;
}
