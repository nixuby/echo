import Button from '@/components/shared/button';
import { usePublishPostMutation } from '@/redux/posts/posts-api';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AttachDialog, { type AttachedFile } from './attach-dialog';
import MediaPreviewDialog from '../dialog/media-preview-dialog';
import { fileToBase64 } from '@shared/file';
import { useDialog } from '../dialog/dialog';

export type CreatePostProps = {
    parentId?: string; // Parent post id for creating replies
};

export default function CreatePost({ parentId }: CreatePostProps) {
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');
    const [files, setFiles] = useState<Array<AttachedFile>>([]);
    const [publishPost] = usePublishPostMutation();
    const dialog = useDialog();

    function handleClickAttach() {
        function handleFinish(newFiles: Array<AttachedFile>) {
            setFiles(newFiles);
            dialog.close();
        }

        dialog.open(
            <AttachDialog
                defaultFiles={structuredClone(files)}
                onFinish={handleFinish}
            />,
        );
    }

    function handleClickImage(ev: React.MouseEvent<HTMLImageElement>) {
        const url = ev.currentTarget.src;
        dialog.open(<MediaPreviewDialog url={url} />);
    }

    function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
        setContent(ev.target.value);
    }

    function handlePublish() {
        Promise.all(files.map(([file]) => fileToBase64(file, true))).then(
            (base64Files) => {
                publishPost({ content, parentId, attachments: base64Files })
                    .unwrap()
                    .then((post) => {
                        navigate(`/post/${post.id}`);
                    })
                    .catch((res) => {
                        const error =
                            (res?.errors?.root as string) ?? 'Unknown error';
                        console.error('Failed to publish post: ' + error);
                    });
            },
        );
    }

    return (
        <div className='flex flex-col gap-2 border-b border-gray-800 px-4 py-2'>
            <textarea
                name='post'
                onChange={handleChange}
                value={content}
                className='h-24 w-full resize-none border border-gray-700 bg-gray-900 px-4 py-2 transition-colors outline-none focus:border-white focus:bg-gray-800'
            ></textarea>
            <div className='flex flex-wrap gap-2'>
                {files.map(([file, urlObject], index) => (
                    <div key={index} className='relative flex flex-col gap-1'>
                        {urlObject && (
                            <div className='size-32'>
                                <img
                                    src={urlObject}
                                    alt={file.name}
                                    onClick={handleClickImage}
                                    className='aspect-square size-full cursor-pointer border border-gray-800 object-cover'
                                />
                            </div>
                        )}
                        <p className='text-sm text-gray-400'>{file.name}</p>
                    </div>
                ))}
            </div>
            <div className='flex justify-between'>
                <Button
                    onClick={handleClickAttach}
                    className='flex items-center gap-1'
                >
                    <PaperClipIcon className='size-5' />
                    <span>Attach</span>
                </Button>
                <Button
                    onClick={handlePublish}
                    className='flex items-center gap-1'
                >
                    <span>Post</span>
                    <PaperAirplaneIcon className='size-5' />
                </Button>
            </div>
        </div>
    );
}
