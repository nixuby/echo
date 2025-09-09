import { useParams } from 'react-router';
import Error404Page from '../error404';
import Layout from '@/components/layout/layout';
import { useAppSelector } from '@/redux/hooks';
import UserProfileHeader from './user-profile-header';
import UserProfileCreatePost from './user-profile-create-post';
import UserProfilePostFeed from './user-profile-post-feed';
import { useGetUserQuery } from '@/redux/user/users-api';

// TODO: Fetch user

export default function UserProfilePage() {
    const { id } = useParams();
    const auth = useAppSelector((s) => s.auth);

    if (!id || id.length === 0 || id[0] !== '@') {
        return <Error404Page />;
    }

    const username = id.slice(1);
    const you = username === auth.user?.username;
    const { data: user, isSuccess } = useGetUserQuery(username);

    return (
        <Layout>
            <div className='flex flex-col'>
                {isSuccess ? (
                    <>
                        <UserProfileHeader user={user} you={you} />
                        {you && <UserProfileCreatePost />}
                        <UserProfilePostFeed username={user.username} />
                    </>
                ) : (
                    'Loading... TODO: Skeleton'
                )}
            </div>
        </Layout>
    );
}
