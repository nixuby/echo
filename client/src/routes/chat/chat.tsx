import { useAppSelector } from '@/redux/hooks';
import { useGetMessagesQuery } from '@/redux/user/users-api';
import Message from './message';
import { useEffect, useRef } from 'react';

export type ChatProps = {
    chatId: string;
};

export default function Chat({ chatId }: ChatProps) {
    const ref = useRef<HTMLDivElement>(null);
    const user = useAppSelector((s) => s.auth.user);
    const { data } = useGetMessagesQuery(chatId ?? '');

    const messagesLoaded = !!data;

    useEffect(() => {
        ref.current?.scrollTo(0, ref.current.scrollHeight);
    }, [messagesLoaded]);

    return (
        <div ref={ref} className='_scrollbar-thin grow overflow-y-auto'>
            <div className='flex grow flex-col'>
                <div className='flex flex-col gap-2 px-4 py-2'>
                    {messagesLoaded &&
                        data.map((msg) => (
                            <Message
                                you={msg.sender.username === user?.username}
                                key={msg.id}
                                {...msg}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
