import { useParams } from 'react-router';
import Error404Page from '../error404';
import Layout from '@/components/layout/layout';
import { useAppSelector } from '@/redux/hooks';
import UserProfileHeader from './user-profile-header';
import { type User } from '@shared/types';
import UserProfileCreatePost from './user-profile-create-post';
import UserProfilePostFeed from './user-profile-post-feed';

// TODO: Fetch user

export default function UserProfilePage() {
    const { id } = useParams();
    const auth = useAppSelector((s) => s.auth);

    if (!id || id.length === 0 || id[0] !== '@') {
        return <Error404Page />;
    }

    const username = id.slice(1);
    const you = username === auth.user?.username;

    const user: User = you
        ? auth.user!
        : {
              id: 'user-id',
              name: null,
              username,
              email: null,
              isEmailVerified: false,
              emailVerifiedAt: null,
          };

    return (
        <Layout>
            <div className='flex flex-col'>
                <UserProfileHeader user={user} you={you} />
                {you && <UserProfileCreatePost />}
                <UserProfilePostFeed username={user.username} />
            </div>
        </Layout>
    );
}
