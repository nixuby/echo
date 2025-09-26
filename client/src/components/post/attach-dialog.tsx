import React, { useRef, useState } from 'react';
import Button from '../shared/button';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { t } from '@/i18next';

export type AttachedFile = [file: File, urlObject?: string];

export type AttachDialogProps = {
    defaultFiles?: Array<AttachedFile>;
    onFinish: (files: Array<AttachedFile>) => void;
};

export default function AttachDialog({
    onFinish,
    defaultFiles,
}: AttachDialogProps) {
    const ref = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<Array<AttachedFile>>(defaultFiles ?? []);

    function handleClickAdd() {
        ref.current?.click();
    }

    function handleClickRemove(ev: React.MouseEvent<HTMLButtonElement>) {
        const index = Number(ev.currentTarget.dataset.index);
        if (!isNaN(index)) {
            setFiles((prev) => prev.filter((_, i) => i !== index));
        }
    }

    function handleClickFinish() {
        onFinish(files);
    }

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        const newFiles = ev.target.files;

        for (const file of newFiles ?? []) {
            if (file) {
                const isImage = file.type.startsWith('image/');

                setFiles((prev) => [
                    ...prev,
                    [file, isImage ? URL.createObjectURL(file) : undefined],
                ]);
            }
        }
    }

    return (
        <div className='flex max-h-[75vh] w-[min(90vw,350px)] flex-col overflow-y-auto border border-gray-800 bg-gray-950 text-white'>
            <h3 className='border-b border-gray-800 px-4 py-2 font-semibold'>
                {t('post.attach-media')}
            </h3>
            <div className='grid grid-cols-2 gap-2 border-b border-gray-800 px-4 py-2'>
                {files.map(([file, urlObject], index) => (
                    <div key={index} className='relative flex flex-col gap-1'>
                        {urlObject && (
                            <img
                                src={urlObject}
                                alt={file.name}
                                className='aspect-square border border-gray-800 object-cover'
                            />
                        )}
                        <p className='text-sm text-gray-400'>{file.name}</p>
                        <button
                            data-index={index}
                            onClick={handleClickRemove}
                            className='absolute top-2 right-2 -m-1 cursor-pointer p-1'
                        >
                            <XMarkIcon className='size-4' />
                        </button>
                    </div>
                ))}
                {files.length === 0 && (
                    <p className='col-span-2 text-center text-sm text-gray-400'>
                        {t('post.no-files-attached')}
                    </p>
                )}
            </div>
            <div className='flex justify-end gap-2 px-4 py-2'>
                <input
                    ref={ref}
                    type='file'
                    multiple
                    accept='image/*,video/*'
                    onChange={handleChange}
                    className='hidden'
                />
                <Button size='small' onClick={handleClickAdd}>
                    {t('add')}
                </Button>
                <Button size='small' onClick={handleClickFinish}>
                    {t('confirm')}
                </Button>
            </div>
        </div>
    );
}
