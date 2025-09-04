import { useEffect, useState } from 'react';
import Post from './post';
import { type Post as TPost } from '@shared/types';
import { jsonReviveDates } from '@shared/json-date';

export default function PostFeed() {
    const [posts, setPosts] = useState<TPost[]>([]);

    useEffect(() => {
        fetch('http://localhost:5179/api/posts')
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    jsonReviveDates(res.data);
                    setPosts(res.data as Array<TPost>);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className='flex flex-col'>
            {posts.map((post) => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
}
