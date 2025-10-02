import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import { t } from '@/i18next';
import { useSendMessageMutation } from '@/redux/user/users-api';
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

export type CreateMessageProps = {
    chatId: string;
    onMessageSent?: () => void;
};

export default function CreateMessage({
    chatId,
    onMessageSent,
}: CreateMessageProps) {
    const [sendMessage] = useSendMessageMutation();
    const [input, setInput] = useState('');

    function handleKeyDown(ev: React.KeyboardEvent) {
        if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            handleClick();
        }
    }

    function handleClick() {
        if (!chatId || input.trim().length === 0) return;
        setInput('');
        sendMessage({ chatId, content: input }).then(() => {
            onMessageSent?.();
        });
    }

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        setInput(ev.target.value);
    }

    return (
        <div className='sticky bottom-0 left-0 flex w-full gap-2 border-t border-gray-800 bg-gray-950 px-4 py-2 pb-18 sm:pb-2'>
            <TextBox
                label={t('messages.message')}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <Button onClick={handleClick}>
                <PaperAirplaneIcon className='size-6' />
            </Button>
        </div>
    );
}
