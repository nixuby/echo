import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './auth/auth-api';
import authReducer from './auth/auth-slice';

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        auth: authReducer,
    },
    middleware: (gdm) => gdm().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
