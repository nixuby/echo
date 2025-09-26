import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import ProtectedRoute from '@/components/protected-route';
import env from '@/env';
import { t } from '@/i18next';
import { useGetChatsQuery } from '@/redux/user/users-api';
import { PlusIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router';

export default function MessagePage() {
    const { data } = useGetChatsQuery();

    return (
        <ProtectedRoute>
            <Layout title={t('messages.label')}>
                <TitleBar>{t('messages.label')}</TitleBar>
                <div className='flex flex-col'>
                    <Link
                        to='/message/new'
                        className='flex cursor-pointer items-center justify-center gap-2 border-b border-gray-800 bg-gray-950 px-6 py-4 font-semibold hover:bg-gray-900'
                    >
                        <PlusIcon className='size-5' />
                        <span>{t('messages.new-chat')}</span>
                    </Link>
                    {data?.map((chat) => (
                        <Link
                            key={chat.id}
                            to={`/chat/${chat.id}`}
                            className='flex items-center gap-2 border-b border-gray-800 bg-gray-950 px-4 py-2 transition hover:bg-gray-900'
                        >
                            <img
                                src={`${env.API_URL}/users/pic/${chat.user.username}-sm`}
                                alt='User Profile Picture'
                                className='size-8 rounded-full'
                            />
                            <div>
                                {chat.user.name ?? `@${chat.user.username}`}
                            </div>
                        </Link>
                    ))}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
