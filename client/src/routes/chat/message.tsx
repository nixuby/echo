import env from '@/env';
import { t } from '@/i18next';
import formatTime from '@/util/format-time';
import type { ClientMessage } from '@shared/types';
import clsx from 'clsx/lite';
import { Link } from 'react-router';

type MessageProps = {
    you: boolean;
    message: ClientMessage;
    details?: boolean;
};

export default function Message({ you, message, details }: MessageProps) {
    return (
        <div
            id={message.id}
            className={clsx(
                'flex w-full max-w-3/4 gap-5',
                you ? 'flex-row-reverse self-end' : 'self-start',
            )}
        >
            {details ? (
                <img
                    src={`${env.API_URL}/users/pic/${message.sender.username}-sm`}
                    alt=''
                    className='size-8 rounded-full'
                />
            ) : (
                <div className='size-8' />
            )}
            <div className='relative flex min-w-1/4 flex-col bg-gray-900 px-3 py-1'>
                {details && (
                    <Link
                        to={`/@${message.sender.username}`}
                        className='text-sm font-semibold text-gray-400 hover:underline'
                    >
                        {message.sender.name ?? `@${message.sender.username}`}
                    </Link>
                )}
                <div>{message.content}</div>
                {details && (
                    <div
                        className={clsx(
                            '_triangle-clip absolute top-0 -left-4 ml-px size-4 bg-gray-900',
                            you && '-right-4 left-auto -scale-100 rotate-90',
                        )}
                    />
                )}
                <div className='text-xs text-gray-400'>
                    {formatTime(t('locale'), new Date(message.createdAt))}
                </div>
            </div>
        </div>
    );
}
