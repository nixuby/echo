import env from '@/env';
import { t } from '@/i18next';
import formatRelativeDate from '@/util/format-relative-date';
import clsx from 'clsx/lite';
import { Link } from 'react-router';

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

export default function Message({
    you,
    id,
    sender,
    content,
    createdAt,
}: MessageProps) {
    return (
        <div
            id={id}
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
                    {formatRelativeDate(t('locale'), new Date(createdAt))}
                </div>
            </div>
        </div>
    );
}
