import PostFeed from '@/components/post/post-feed';

export type UserProfilePostFeedProps = {
    username: string;
};

export default function UserProfilePostFeed({
    username,
}: UserProfilePostFeedProps) {
    return <PostFeed query={{ type: 'profile', username }} />;
}
