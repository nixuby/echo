import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import router from './router';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AuthProvider from './components/auth/auth-provider';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <AuthProvider />
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
