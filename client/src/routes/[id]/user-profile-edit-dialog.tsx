import { useDialog } from '@/components/dialog/dialog';
import Button from '@/components/shared/button';
import { useUpdateProfilePictureMutation } from '@/redux/user/users-api';
import { fileToBase64 } from '@shared/file';
import { useRef, useState } from 'react';

export default function UserProfileEditDialog() {
    const [page, setPage] = useState('menu');

    return (
        <div className='border border-gray-800 bg-gray-950 text-white'>
            {(() => {
                switch (page) {
                    case 'menu':
                        return <Menu setPage={setPage} />;
                    case 'pfp':
                        return <EditProfilePicture />;
                    case 'cover':
                        return <EditCoverPhoto />;
                    case 'bio':
                        return <EditBio />;
                    default:
                        return null;
                }
            })()}
        </div>
    );
}

function Menu({ setPage }: { setPage: (page: string) => void }) {
    const dialog = useDialog();

    function handleClick(ev: React.MouseEvent<HTMLButtonElement>) {
        const target = ev.currentTarget;
        const page = target.dataset.page;
        if (page) {
            setPage(page);
        }
    }

    function handleClickClose() {
        dialog.close();
    }

    return (
        <div className='flex flex-col'>
            <button
                onClick={handleClick}
                data-page='pfp'
                className='cursor-pointer border-b border-gray-800 bg-gray-950 px-4 py-2 text-start font-semibold transition-colors hover:bg-gray-900'
            >
                Edit Profile Picture
            </button>
            <button
                onClick={handleClick}
                data-page='cover'
                className='cursor-pointer border-b border-gray-800 bg-gray-950 px-4 py-2 text-start font-semibold transition-colors hover:bg-gray-900'
            >
                Edit Cover Photo
            </button>
            <button
                onClick={handleClick}
                data-page='bio'
                className='cursor-pointer border-b border-gray-800 bg-gray-950 px-4 py-2 text-start font-semibold transition-colors hover:bg-gray-900'
            >
                Edit Bio
            </button>
            <button
                onClick={handleClickClose}
                className='cursor-pointer bg-gray-950 px-4 py-2 text-start font-semibold transition-colors hover:bg-gray-900'
            >
                Close
            </button>
        </div>
    );
}

function EditProfilePicture() {
    const ref = useRef<HTMLInputElement>(null);
    const [urlObject, setUrlObject] = useState<string | null>(null);
    const [updateProfilePicture] = useUpdateProfilePictureMutation();

    function handleClickSelectFile() {
        ref.current?.click();
    }

    function handleClickConfirm() {
        const files = ref?.current?.files;
        if (!files) return;
        const file = files[0];
        if (!file) return;

        fileToBase64(file).then((b64) => {
            updateProfilePicture(b64);
        });
    }

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        const files = ev.currentTarget.files;
        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            setUrlObject(url);
        }
    }

    return (
        <div className='flex flex-col'>
            <h2 className='border-b border-gray-800 px-4 py-2 font-bold'>
                Edit Profile Picture
            </h2>
            <input
                ref={ref}
                type='file'
                accept='image/jpeg,image/png,image/avif,image/webp,image/gif'
                onChange={handleChange}
                className='hidden'
            />
            <div className='flex flex-col px-4 py-2'>
                {urlObject && (
                    <img
                        src={urlObject}
                        alt='Selected file'
                        className='mb-2 w-64 border border-gray-800'
                    />
                )}
                <div className='flex flex-col gap-2 self-end'>
                    <Button size='small' onClick={handleClickSelectFile}>
                        Select File
                    </Button>
                    {urlObject && (
                        <Button size='small' onClick={handleClickConfirm}>
                            Confirm
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function EditCoverPhoto() {
    return (
        <div className='flex flex-col'>
            <h2 className='border-b border-gray-800 px-4 py-2 font-bold'>
                Edit Cover Photo
            </h2>
        </div>
    );
}

function EditBio() {
    return (
        <div className='flex flex-col'>
            <h2 className='border-b border-gray-800 px-4 py-2 font-bold'>
                Edit Profile Bio
            </h2>
        </div>
    );
}
