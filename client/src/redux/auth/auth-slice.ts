import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '@shared/types';

type AuthState = {
    user: User | null;
};

const initialState: AuthState = {
    user: null,
};

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
    },
});

export const { setUser } = slice.actions;

export default slice.reducer;
