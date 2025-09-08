import Layout from '../../../components/layout/layout';
import Post from '../../../components/post/post';
import { useNavigate, useParams } from 'react-router';
import { useGetPostQuery } from '@/redux/posts/posts-api';
import Error404Page from '@/routes/error404';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

export type PostPageParams = {
    id: string;
};

export default function PostPage() {
    const navigate = useNavigate();
    const params = useParams<PostPageParams>();
    const postId = params.id;
    if (!postId) return <Error404Page />;
    const { data: post, isSuccess } = useGetPostQuery(params.id);

    function handleClickBack() {
        navigate(-1);
    }

    return (
        <Layout title='Post'>
            <div className='flex items-center gap-2 border-b border-gray-800 px-4 py-2'>
                <button
                    type='button'
                    role='button'
                    onClick={handleClickBack}
                    className='cursor-pointer'
                >
                    <ArrowLeftIcon className='size-5' />
                </button>
                <h2 className='text-xl font-bold'>Post</h2>
            </div>
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
