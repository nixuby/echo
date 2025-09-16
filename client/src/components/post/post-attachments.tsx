import env from '@/env';
import { openDialog } from '@/redux/dialog/dialog-slice';
import { useAppDispatch } from '@/redux/hooks';
import type { PostAttachment } from '@shared/types';
import MediaPreviewDialog from '../dialog/media-preview-dialog';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export type PostAttachmentsProps = {
    attachments: Array<PostAttachment>;
};

function url(attachment: PostAttachment) {
    return `${env.API_URL}/posts/attachment/${attachment.id}`;
}

export default function PostAttachments({ attachments }: PostAttachmentsProps) {
    const [selectedAttachment, setSelectedAttachment] = useState(0);
    const dispatch = useAppDispatch();

    if (attachments.length === 0) {
        return null;
    }

    function handleClick(ev: React.MouseEvent<HTMLDivElement>) {
        ev.stopPropagation();
        const id = ev.currentTarget.dataset.index as string;
        const attachment = attachments.find((a) => a.id === id);
        if (!attachment) return;
        dispatch(openDialog(<MediaPreviewDialog url={url(attachment)} />));
    }

    function handleClickControl(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.stopPropagation();
        const delta = Number(ev.currentTarget.dataset.delta);
        if (isNaN(delta)) return;
        setSelectedAttachment((prev) => {
            let next = prev + delta;
            if (next < 0) next = attachments.length - 1;
            if (next >= attachments.length) next = 0;
            return next;
        });
    }

    const attachment = attachments[selectedAttachment];
    const hasControls = attachments.length > 1;

    return (
        <div className='relative flex w-max gap-1'>
            {hasControls && (
                <div className='flex items-center'>
                    <button
                        data-delta={-1}
                        onClick={handleClickControl}
                        className='cursor-pointer border border-gray-800 bg-gray-900 p-1 hover:bg-gray-800'
                    >
                        <ChevronLeftIcon className='size-4' />
                    </button>
                </div>
            )}
            <div
                data-index={attachment.id}
                onClick={handleClick}
                className='flex size-64 cursor-pointer items-center justify-center border border-gray-800 bg-black/50'
            >
                <img
                    key={attachment.id}
                    src={url(attachment)}
                    alt='Post attachment'
                />
            </div>
            {hasControls && (
                <div className='flex items-center'>
                    <button
                        data-delta={1}
                        onClick={handleClickControl}
                        className='cursor-pointer border border-gray-800 bg-gray-900 p-1 hover:bg-gray-800'
                    >
                        <ChevronRightIcon className='size-4' />
                    </button>
                </div>
            )}
            {hasControls && (
                <div className='absolute bottom-1 left-1/2 -translate-x-1/2 text-sm text-gray-400'>
                    {selectedAttachment + 1} / {attachments.length}
                </div>
            )}
        </div>
    );
}
