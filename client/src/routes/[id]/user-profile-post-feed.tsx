import PostFeed from '@/components/post/post-feed';
import { useGetPostFeedQuery } from '@/redux/posts/posts-api';

export type UserProfilePostFeedProps = {
    username: string;
};

export default function UserProfilePostFeed({
    username,
}: UserProfilePostFeedProps) {
    const { data } = useGetPostFeedQuery({ page: 1, username });

    return <PostFeed posts={data} />;
}
