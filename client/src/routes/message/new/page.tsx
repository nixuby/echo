import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import ProtectedRoute from '@/components/protected-route';
import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import env from '@/env';
import { t } from '@/i18next';
import { useCreateChatMutation, useSearchQuery } from '@/redux/user/users-api';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function NewChatPage() {
    const navigate = useNavigate();

    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { data } = useSearchQuery(
        { q: searchQuery },
        {
            skip: searchQuery.length < 3,
        },
    );

    const [createChat] = useCreateChatMutation();

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        setInput(ev.target.value);
    }

    function handleClickSearch() {
        setSearchQuery(input);
    }

    function handleClickUser(ev: React.MouseEvent<HTMLButtonElement>) {
        if (isLoading) return;
        setIsLoading(true);
        const username = ev.currentTarget.dataset.username;
        if (!username) return;
        createChat(username)
            .then((res) => {
                const chatId = res.data;
                if (chatId) {
                    navigate(`/chat/${chatId}`);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <ProtectedRoute>
            <Layout title={t('messages.new-chat')}>
                <div className='flex flex-col'>
                    <TitleBar>{t('messages.new-chat')}</TitleBar>
                    <div className='flex gap-2 border-b border-gray-800 px-4 py-2'>
                        <TextBox
                            label={t('username')}
                            value={input}
                            onChange={handleChange}
                        />
                        {/* TODO: Replace with debounce */}
                        <Button onClick={handleClickSearch}>
                            {t('search')}
                        </Button>
                    </div>
                    {data &&
                        data.users &&
                        data.users.map((user) => (
                            <button
                                key={user.username}
                                type='button'
                                data-username={user.username}
                                onClick={handleClickUser}
                                className='flex cursor-pointer items-center gap-4 border-b border-gray-800 bg-gray-950 px-4 py-2 transition hover:bg-gray-900'
                            >
                                <img
                                    src={`${env.API_URL}/users/pic/${user.username}-sm`}
                                    alt='User Profile Picture'
                                    className='block size-12 rounded-full'
                                />
                                {user.name ? (
                                    <div className='flex flex-col'>
                                        <span>{user.name}</span>
                                        <span className='text-left text-sm text-gray-400'>
                                            @{user.username}
                                        </span>
                                    </div>
                                ) : (
                                    <div>@{user.username}</div>
                                )}
                            </button>
                        ))}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
