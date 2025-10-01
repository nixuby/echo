import { useAppSelector } from '@/redux/hooks';
import { useGetMessagesInfiniteQuery } from '@/redux/user/users-api';
import Message from './message';
import { useEffect, useRef, useState } from 'react';

export type ChatProps = {
    ref: React.RefObject<HTMLDivElement | null>;
    chatId: string;
};

export default function Chat({ ref, chatId }: ChatProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const user = useAppSelector((s) => s.auth.user);
    const { data, isSuccess, hasNextPage, fetchNextPage, isFetching } =
        useGetMessagesInfiniteQuery(chatId ?? '');
    const messages = data?.pages.flat() ?? [];
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (isSuccess && data.pages.length > 0 && !loaded) {
            ref.current?.scrollTo(0, ref.current.scrollHeight);
            setLoaded(true);
        }
    }, [isSuccess, data]);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetching) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [isFetching]);

    return (
        <div
            ref={ref}
            className='_scrollbar-thin flex grow flex-col-reverse gap-2 overflow-y-auto px-4 py-2'
        >
            {isSuccess &&
                messages.map((msg) => (
                    <Message
                        you={msg.sender.username === user?.username}
                        key={msg.id}
                        {...msg}
                    />
                ))}
            <div className='grow' />
            {isSuccess && hasNextPage && (
                <div ref={loadMoreRef} className='h-20' />
            )}
        </div>
    );
}
