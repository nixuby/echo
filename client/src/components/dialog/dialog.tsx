import { closeDialog } from '@/redux/dialog/dialog-slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { XMarkIcon } from '@heroicons/react/20/solid';

export default function Dialog() {
    const dispatch = useAppDispatch();
    const dialogs = useAppSelector((s) => s.dialog.dialogs);

    if (dialogs.length === 0) return null;

    function handleClickBg(ev: React.MouseEvent<HTMLDivElement>) {
        ev.stopPropagation();
        dispatch(closeDialog());
    }

    function handleClickDialog(ev: React.MouseEvent<HTMLDivElement>) {
        ev.stopPropagation();
    }

    return (
        <>
            {dialogs.map((dialog) => (
                <div
                    key={dialog.id}
                    onClick={handleClickBg}
                    style={{ zIndex: 200 + dialog.z }}
                    className={`_dialog-bg-open-anim fixed top-0 left-0 flex h-full w-full items-center justify-center bg-black/20 backdrop-blur-md`}
                >
                    <div className='fixed top-4 right-4 -m-2 cursor-pointer rounded-full p-2 text-white transition-colors hover:bg-white/10'>
                        <XMarkIcon className='size-10' />
                    </div>
                    <div
                        onClick={handleClickDialog}
                        className='_dialog-open-anim'
                    >
                        {dialog.body}
                    </div>
                </div>
            ))}
        </>
    );
}
