import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import router from './routes/router';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import StateLoader from './components/state-loader';
import './env';
import { DialogProvider } from './components/dialog/dialog';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <StateLoader>
                <DialogProvider>
                    <RouterProvider router={router} />
                </DialogProvider>
            </StateLoader>
        </Provider>
    </StrictMode>,
);
