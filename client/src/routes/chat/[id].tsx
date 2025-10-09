import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import protectedRoute from '@/components/protected-route';
import { useAppSelector } from '@/redux/hooks';
import { useParams } from 'react-router';
import Chat from './chat';
import CreateMessage from './create-message';
import { useRef } from 'react';
import { t } from '@/i18next';

export default function ChatPage() {
    return protectedRoute(() => {
        const chatId = useParams().id;
        const user = useAppSelector((s) => s.auth.user);
        const chatRef = useRef<HTMLDivElement>(null);

        if (!user) return null;
        if (!chatId) return null;

        function onMessageSent() {
            chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
        }

        return (
            <Layout
                title={t('messages.chat')}
                className='relative flex h-[calc(100vh_-_3rem)] flex-col justify-between'
            >
                <TitleBar>{t('messages.chat')}</TitleBar>
                <Chat ref={chatRef} chatId={chatId} />
                <CreateMessage chatId={chatId} onMessageSent={onMessageSent} />
            </Layout>
        );
    });
}
