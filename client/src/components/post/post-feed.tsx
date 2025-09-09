import Post from './post';
import { type Post as TPost } from '@shared/types';

export type PostFeedProps = {
    posts: TPost[] | null | undefined;
};

export default function PostFeed({ posts }: PostFeedProps) {
    return (
        <div className='flex flex-col'>
            {posts &&
                posts.map((post) => <Post key={post.id} short post={post} />)}
        </div>
    );
}
