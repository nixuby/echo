import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import ProtectedRoute from '@/components/protected-route';
import { useAppSelector } from '@/redux/hooks';
import { useParams } from 'react-router';
import Chat from './chat';
import CreateMessage from './create-message';

export default function ChatPage() {
    const chatId = useParams().id;
    const user = useAppSelector((s) => s.auth.user);

    if (!user) return null;
    if (!chatId) return null;

    return (
        <ProtectedRoute>
            <Layout
                title='Chat'
                className='relative flex h-[calc(100vh_-_3rem)] flex-col justify-between'
            >
                <TitleBar>Chat</TitleBar>
                <Chat chatId={chatId} />
                <CreateMessage chatId={chatId} />
            </Layout>
        </ProtectedRoute>
    );
}
