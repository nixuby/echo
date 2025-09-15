import PostFeed from '@/components/post/post-feed';
import { useGetPostFeedQuery } from '@/redux/posts/posts-api';

export type UserProfilePostFeedProps = {
    username: string;
};

export default function UserProfilePostFeed({
    username,
}: UserProfilePostFeedProps) {
    const { data } = useGetPostFeedQuery({
        type: 'profile',
        username,
        page: 1,
    });

    return <PostFeed posts={data} />;
}
