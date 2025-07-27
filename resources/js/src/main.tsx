import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind css
import './tailwind.css';

// i18n (needs to be bundled)
import './i18n';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import store from './store/index';

// Mantine
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <Suspense>
                <Provider store={store}>
                    <MantineProvider>
                    <RouterProvider router={router} />
                    </MantineProvider>
                </Provider>
            </Suspense>
        </ErrorBoundary>
    </React.StrictMode>
);

