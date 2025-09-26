import Layout from '../../../components/layout/layout';
import Post from '../../../components/post/post';
import { useParams } from 'react-router';
import { useGetPostQuery } from '@/redux/posts/posts-api';
import Error404Page from '@/routes/error404';
import TitleBar from '@/components/layout/titlebar';
import { useAppSelector } from '@/redux/hooks';
import CreatePost from '@/components/post/create-post';
import RepliesPostFeed from '@/components/post/replies-post-feed';
import { t } from '@/i18next';

export type PostPageParams = {
    id: string;
};

export default function PostPage() {
    const user = useAppSelector((state) => state.auth.user);
    const params = useParams<PostPageParams>();
    const postId = params.id;
    if (!postId) return <Error404Page />;
    const { data: post, isSuccess } = useGetPostQuery(params.id);

    return (
        <Layout title={t('post.label')}>
            <TitleBar>{t('post.label')}</TitleBar>
            {isSuccess ? <Post clickable={false} post={post} /> : 'Loading...'}
            <section className='flex flex-col'>
                <h3
                    id='Reply'
                    className='border-b border-gray-800 px-4 py-2 text-xl font-bold'
                >
                    {t('post.replies')}&nbsp;&middot;&nbsp;
                    <span className='font-normal text-gray-400'>
                        {post?.replyCount}
                    </span>
                </h3>
                {user && <CreatePost parentId={postId} />}
                <RepliesPostFeed postId={postId} />
            </section>
        </Layout>
    );
}
