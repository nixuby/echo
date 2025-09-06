import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './auth/auth-api';
import authReducer from './auth/auth-slice';
import { settingsApi } from './settings/settings-api';

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [settingsApi.reducerPath]: settingsApi.reducer,
        auth: authReducer,
    },
    middleware: (gdm) =>
        gdm().concat(authApi.middleware).concat(settingsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
