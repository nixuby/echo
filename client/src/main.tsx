import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import router from './routes/router';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './env';
import Loading from './components/loading';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <Suspense fallback={<Loading />}>
                <RouterProvider router={router} />
            </Suspense>
        </Provider>
    </StrictMode>,
);
