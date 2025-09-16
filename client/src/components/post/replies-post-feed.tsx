import PostFeed from './post-feed';

export type RepliesPostFeedProps = {
    postId: string;
};

export default function RepliesPostFeed({ postId }: RepliesPostFeedProps) {
    return <PostFeed query={{ type: 'reply', parentId: postId }} />;
}
