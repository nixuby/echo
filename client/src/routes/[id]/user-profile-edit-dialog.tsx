import { useDialog } from '@/components/dialog/dialog';
import Button from '@/components/shared/button';
import { useAppSelector } from '@/redux/hooks';
import {
    useUpdateBioMutation,
    useUpdateProfilePictureMutation,
} from '@/redux/user/users-api';
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
        <div className='flex max-h-[75vh] w-[min(90vw,350px)] flex-col overflow-y-auto'>
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
    const dialog = useDialog();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const [urlObject, setUrlObject] = useState<string | null>(null);
    const [updateProfilePicture] = useUpdateProfilePictureMutation();
    const user = useAppSelector((s) => s.auth.user);

    function handleClickSelectFile() {
        ref.current?.click();
    }

    function handleClickConfirm() {
        const files = ref?.current?.files;
        if (!files) return;
        const file = files[0];
        if (!file) return;

        setIsLoading(true);

        fileToBase64(file).then((b64) => {
            updateProfilePicture(b64)
                .then(() => {
                    dialog.close();
                    const pfps = document.querySelectorAll('img.__pfp');
                    for (const pfp of pfps) {
                        const username = pfp.getAttribute('data-user');
                        if (username === user?.username) {
                            // refresh the profile picture by changing the src attribute
                            const url = new URL(
                                pfp.getAttribute('src') || '',
                                location.origin,
                            );
                            url.searchParams.set('t', Date.now().toString());
                            pfp.setAttribute('src', url.toString());
                        }
                    }
                })
                .finally(() => setIsLoading(false));
        });
    }

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        const files = ev.currentTarget.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/') === false) {
                return setError('Please select an image file');
            }
            const url = URL.createObjectURL(file);
            setUrlObject(url);
        }
    }

    return (
        <div className='flex max-h-[75vh] w-[min(90vw,350px)] flex-col overflow-y-auto'>
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
            {error && (
                <div className='px-4 py-2'>
                    <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                        {error}
                    </div>
                </div>
            )}
            <div className='flex flex-col items-center px-4 py-2'>
                {urlObject && (
                    <div className='aspect-square w-full'>
                        <img
                            src={urlObject}
                            alt='Selected file'
                            className='mb-2 aspect-square w-full border border-gray-800 object-cover object-center'
                        />
                    </div>
                )}
                <div className='flex flex-col gap-2 self-end'>
                    <Button size='small' onClick={handleClickSelectFile}>
                        Select File
                    </Button>
                    {urlObject && (
                        <Button
                            disabled={isLoading}
                            size='small'
                            onClick={handleClickConfirm}
                        >
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
        <div className='flex max-h-[75vh] w-[min(90vw,350px)] flex-col overflow-y-auto'>
            <h2 className='border-b border-gray-800 px-4 py-2 font-bold'>
                Edit Cover Photo
            </h2>
        </div>
    );
}

function EditBio() {
    const user = useAppSelector((s) => s.auth.user);
    const [input, setInput] = useState(user?.bio || '');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [updateBio] = useUpdateBioMutation();
    const dialog = useDialog();

    function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(ev.currentTarget.value);
        setError(null);
    }

    function handleClick() {
        setIsLoading(true);
        updateBio(input)
            .unwrap()
            .then(() => dialog.close())
            .catch((error) => setError(error.message))
            .finally(() => setIsLoading(false));
    }

    return (
        <div className='flex max-h-[75vh] w-[min(90vw,350px)] flex-col overflow-y-auto'>
            <h2 className='border-b border-gray-800 px-4 py-2 font-bold'>
                Edit Profile Bio
            </h2>
            <div className='flex flex-col gap-2 px-4 py-2'>
                <div>
                    <textarea
                        name='post'
                        onChange={handleChange}
                        value={input}
                        className='h-24 w-full resize-none border border-gray-700 bg-gray-900 px-4 py-2 transition-colors outline-none focus:border-white focus:bg-gray-800'
                    ></textarea>
                </div>
                {error && (
                    <div>
                        <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                            {error}
                        </div>
                    </div>
                )}
                <Button
                    disabled={isLoading}
                    size='small'
                    onClick={handleClick}
                    className='self-end'
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
