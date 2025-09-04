import { useEffect, useState } from 'react';
import Layout from '../components/layout/layout';
import { type Post as TPost } from '@shared/types';
import Post from '../components/post/post';
import { useParams } from 'react-router';
import { jsonReviveDates } from '@shared/json-date';

export type PostRouteParams = {
    id: string;
};

export default function PostRoute() {
    const params = useParams<PostRouteParams>();
    const [post, setPost] = useState<TPost | null>(null);

    useEffect(() => {
        fetch(`http://localhost:5179/api/post/${params.id}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    jsonReviveDates(res.data);
                    setPost(res.data as TPost);
                }
            });
    }, []);

    return (
        <Layout title='Post'>
            {post ? <Post clickable={false} post={post} /> : 'Loading...'}
            <section>
                <h3 className='border-b border-gray-800 px-4 py-2 text-xl font-bold'>
                    Replies&nbsp;&middot;&nbsp;
                    <span className='font-normal text-gray-400'>
                        {post?.stats.comments}
                    </span>
                </h3>
                <div className='bg-yellow-700 p-4'>TODO: Add replies</div>
            </section>
        </Layout>
    );
}
