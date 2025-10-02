import { useAppSelector } from '@/redux/hooks';
import {
    useGetMessagesInfiniteQuery,
    usePollMessagesQuery,
} from '@/redux/user/users-api';
import Message from './message';
import { Fragment, useEffect, useRef, useState } from 'react';
import { t } from '@/i18next';

export type ChatProps = {
    ref: React.RefObject<HTMLDivElement | null>;
    chatId: string;
};

function areDaysDifferent(d1: Date, d2: Date) {
    return (
        d1.getDate() !== d2.getDate() ||
        d1.getMonth() !== d2.getMonth() ||
        d1.getFullYear() !== d2.getFullYear()
    );
}

export default function Chat({ ref, chatId }: ChatProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const user = useAppSelector((s) => s.auth.user);
    const { data, isSuccess, hasNextPage, fetchNextPage, isFetching } =
        useGetMessagesInfiniteQuery(chatId ?? '');
    const messages =
        data?.pages.flatMap((page) => page.messages).reverse() ?? [];
    const [loaded, setLoaded] = useState(false);
    const { data: newMessages } = usePollMessagesQuery(
        {
            chatId,
            since: messages.length
                ? messages[messages.length - 1].createdAt
                : undefined,
        },
        {
            pollingInterval: 1000,
        },
    );

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
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    });

    useEffect(() => {
        // if scrollbar is at the bottom, scroll to bottom when new messages arrive
        if (
            ref.current &&
            ref.current.scrollHeight - ref.current.scrollTop <=
                ref.current.clientHeight + 100
        ) {
            ref.current.scrollTo(0, ref.current.scrollHeight);
        }
    }, [newMessages]);

    let previousDate: Date = new Date(0);
    let previousUser: string = '';

    return (
        <div
            ref={ref}
            className='_scrollbar-thin flex grow flex-col gap-2 overflow-y-auto px-4 py-2'
        >
            {hasNextPage && !isFetching ? (
                <div className='relative'>
                    <div
                        ref={loadMoreRef}
                        className='absolute top-180 left-0 h-10 w-full'
                    ></div>
                </div>
            ) : null}
            <div className='grow' />
            {isSuccess &&
                messages.map((message) => {
                    const prevDate = previousDate;
                    const prevUser = previousUser;

                    previousDate = new Date(message.createdAt);
                    previousUser = message.sender.username;

                    const datesDifferent = areDaysDifferent(
                        prevDate,
                        new Date(message.createdAt),
                    );

                    const usersDifferent = message.sender.username !== prevUser;

                    return (
                        <Fragment key={message.id}>
                            {datesDifferent && (
                                <div className='relative'>
                                    <div className='absolute top-1/2 left-0 z-0 h-px w-full bg-gray-600' />
                                    <div className='relative z-1 flex w-full justify-center'>
                                        <span className='bg-gray-950 px-2 text-sm font-bold text-gray-600'>
                                            {new Intl.DateTimeFormat(
                                                t('locale'),
                                                {
                                                    dateStyle: 'medium',
                                                },
                                            ).format(
                                                new Date(message.createdAt),
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <Message
                                you={message.sender.username === user?.username}
                                message={message}
                                details={usersDifferent || datesDifferent}
                            />
                        </Fragment>
                    );
                })}
        </div>
    );
}
