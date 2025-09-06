import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import router from './router';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import StateLoader from './components/state-loader';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <StateLoader>
                <RouterProvider router={router} />
            </StateLoader>
        </Provider>
    </StrictMode>,
);
