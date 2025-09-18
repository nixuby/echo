import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import ProtectedRoute from '@/components/protected-route';
import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import { useAppSelector } from '@/redux/hooks';
import {
    useGetMessagesQuery,
    useSendMessageMutation,
} from '@/redux/user/users-api';
import { Link, useParams } from 'react-router';
import clsx from 'clsx/lite';
import env from '@/env';
import formatRelativeDate from '@/util/format-relative-date';
import { useState } from 'react';

export default function ChatPage() {
    const id = useParams().id;
    const [sendMessage] = useSendMessageMutation();
    const { data } = useGetMessagesQuery(id ?? '');
    const user = useAppSelector((s) => s.auth.user);
    const [input, setInput] = useState('');

    if (!user) return null;

    function handleClick() {
        if (!id) return;
        setInput('');
        sendMessage({ chatId: id, content: input });
    }

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        setInput(ev.target.value);
    }

    return (
        <ProtectedRoute>
            <Layout
                title='Chat'
                className='relative flex h-[calc(100vh_-_3rem)] flex-col justify-between'
            >
                <TitleBar>Chat</TitleBar>
                <div className='grow overflow-y-auto'>
                    <div className='flex grow flex-col'>
                        <div className='flex flex-col gap-2 px-4 py-2'>
                            {data?.map((msg) => (
                                <Message
                                    you={msg.sender.username === user.username}
                                    key={msg.id}
                                    {...msg}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className='sticky bottom-0 left-0 flex w-full gap-2 border-t border-gray-800 bg-gray-950 px-4 py-2'>
                    <TextBox
                        label='Message'
                        value={input}
                        onChange={handleChange}
                    />
                    <Button onClick={handleClick}>Send</Button>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}

type MessageProps = {
    you: boolean;
    id: string;
    sender: {
        name: string | null;
        username: string;
        isVerified: boolean;
    };
    content: string;
    createdAt: string;
};

function Message({ you, sender, content, createdAt }: MessageProps) {
    return (
        <div
            className={clsx(
                'flex w-full max-w-3/4 gap-5',
                you ? 'flex-row-reverse self-end' : 'self-start',
            )}
        >
            <img
                src={`${env.API_URL}/users/pic/${sender.username}-sm`}
                alt=''
                className='size-8 rounded-full'
            />
            <div className='relative flex min-w-1/4 flex-col bg-gray-900 px-3 py-1'>
                <Link
                    to={`/@${sender.username}`}
                    className='text-sm font-semibold text-gray-400 hover:underline'
                >
                    {sender.name ?? `@${sender.username}`}
                </Link>
                <div>{content}</div>
                <div
                    className={clsx(
                        '_triangle-clip absolute top-0 -left-4 ml-px size-4 bg-gray-900',
                        you && '-right-4 left-auto -scale-100 rotate-90',
                    )}
                ></div>
                <div className='text-xs text-gray-400'>
                    {formatRelativeDate(new Date(createdAt))}
                </div>
            </div>
        </div>
    );
}
