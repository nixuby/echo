import { createSlice } from '@reduxjs/toolkit';

type Dialog = {
    id: string;
    body: React.ReactNode;
    z: number;
};

type DialogState = {
    dialogs: Dialog[]; // Dialog stack
};

const initialState: DialogState = {
    dialogs: [],
};

const slice = createSlice({
    name: 'dialog',
    initialState,
    reducers: {
        openDialog: (state, action: { payload: React.ReactNode }) => {
            const newDialog: Dialog = {
                body: action.payload,
                id: crypto.randomUUID(),
                z: state.dialogs.length + 1,
            };
            state.dialogs.push(newDialog);
        },
        closeDialog: (state, action: { payload?: string }) => {
            if (!action.payload) {
                state.dialogs.pop();
            } else {
                const dialogIndex = state.dialogs.findIndex(
                    (dialog) => dialog.id === action.payload,
                );
                if (dialogIndex !== -1) {
                    state.dialogs.splice(dialogIndex, 1);
                }
            }
        },
    },
});

export const { openDialog, closeDialog } = slice.actions;

export default slice.reducer;
