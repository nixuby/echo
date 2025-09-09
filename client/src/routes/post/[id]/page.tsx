import Layout from '../../../components/layout/layout';
import Post from '../../../components/post/post';
import { useParams } from 'react-router';
import { useGetPostQuery } from '@/redux/posts/posts-api';
import Error404Page from '@/routes/error404';
import TitleBar from '@/components/layout/titlebar';

export type PostPageParams = {
    id: string;
};

export default function PostPage() {
    const params = useParams<PostPageParams>();
    const postId = params.id;
    if (!postId) return <Error404Page />;
    const { data: post, isSuccess } = useGetPostQuery(params.id);

    return (
        <Layout title='Post'>
            <TitleBar>Post</TitleBar>
            {isSuccess ? <Post clickable={false} post={post} /> : 'Loading...'}
            <section>
                <h3 className='border-b border-gray-800 px-4 py-2 text-xl font-bold'>
                    Replies&nbsp;&middot;&nbsp;
                    <span className='font-normal text-gray-400'>0</span>
                </h3>
                <div className='bg-yellow-700 p-4'>TODO: Add replies</div>
            </section>
        </Layout>
    );
}
