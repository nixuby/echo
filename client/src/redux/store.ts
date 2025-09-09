import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './auth/auth-api';
import authReducer from './auth/auth-slice';
import dialogReducer from './dialog/dialog-slice';
import { settingsApi } from './settings/settings-api';
import { postsApi } from './posts/posts-api';
import { usersApi } from './user/users-api';

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [postsApi.reducerPath]: postsApi.reducer,
        [settingsApi.reducerPath]: settingsApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
        auth: authReducer,
        dialog: dialogReducer,
    },
    middleware: (gdm) =>
        gdm()
            .concat(authApi.middleware)
            .concat(postsApi.middleware)
            .concat(settingsApi.middleware)
            .concat(usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
