import Layout from '@/components/layout/layout';
import PostFeed from '@/components/post/post-feed';
import protectedRoute from '@/components/protected-route';
import { t } from '@/i18next';

export default function SavedPostsPage() {
    return protectedRoute(() => {
        return (
            <Layout title={t('saved')}>
                <PostFeed
                    query={{
                        type: 'saved',
                    }}
                />
            </Layout>
        );
    });
}
