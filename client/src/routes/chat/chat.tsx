import { useAppSelector } from '@/redux/hooks';
import { useGetMessagesQuery } from '@/redux/user/users-api';
import Message from './message';
import { useEffect } from 'react';

export type ChatProps = {
    ref: React.RefObject<HTMLDivElement | null>;
    chatId: string;
};

export default function Chat({ ref, chatId }: ChatProps) {
    const user = useAppSelector((s) => s.auth.user);
    const { data, isSuccess } = useGetMessagesQuery(chatId ?? '');

    useEffect(() => {
        if (isSuccess) ref.current?.scrollTo(0, ref.current.scrollHeight);
    }, [isSuccess, data]);

    return (
        <div
            ref={ref}
            className='_scrollbar-thin flex grow flex-col gap-2 overflow-y-auto px-4 py-2'
        >
            <div className='grow' />
            {isSuccess &&
                data.map((msg) => (
                    <Message
                        you={msg.sender.username === user?.username}
                        key={msg.id}
                        {...msg}
                    />
                ))}
        </div>
    );
}
