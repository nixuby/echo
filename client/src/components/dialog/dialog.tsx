import { XMarkIcon } from '@heroicons/react/20/solid';
import { createContext, useContext, useState } from 'react';

type Dialog = {
    id: string;
    body: React.ReactNode;
    z: number;
};

type DialogState = {
    dialogs: Array<Dialog>;
    open: (body: React.ReactNode) => void;
    close: () => void;
};

export const DialogContext = createContext<DialogState | null>(null);

export const useDialog = () => useContext(DialogContext)!;

export function Dialog() {
    const dialog = useDialog();

    if (dialog.dialogs.length === 0) return null;

    function handleClickBg(ev: React.MouseEvent<HTMLDivElement>) {
        ev.stopPropagation();
        dialog.close();
    }

    function handleClickDialog(ev: React.MouseEvent<HTMLDivElement>) {
        ev.stopPropagation();
    }

    return (
        <>
            {dialog.dialogs.map((dialog) => (
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

export function DialogProvider({ children }: { children: React.ReactNode }) {
    const [dialogs, setDialogs] = useState<Array<Dialog>>([]);

    const dialogState: DialogState = {
        dialogs,
        open(body) {
            setDialogs((state) => {
                const newState = structuredClone(state);
                newState.push({
                    id: (Math.random() * 1e16).toString(36),
                    body,
                    z: newState.length,
                });
                return newState;
            });
        },
        close() {
            setDialogs((prev) => prev.slice(0, -1));
        },
    };

    return (
        <DialogContext.Provider value={dialogState}>
            <Dialog />
            {children}
        </DialogContext.Provider>
    );
}
