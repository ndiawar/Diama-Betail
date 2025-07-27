import React from 'react';
import { lazy } from 'react';

const Index = lazy(() => import('../pages/Index'));
const Vaches = lazy(() => import('../pages/Vaches'));
const Carte = lazy(() => import('../pages/Carte'));

const routes = [
    // dashboard
    {
        path: '/',
        element: <Index />,
        layout: 'default',
    },
    // vaches
    {
        path: '/vaches',
        element: <Vaches />,
        layout: 'default',
    },
    // carte
    {
        path: '/carte',
        element: <Carte />,
        layout: 'default',
    },
];

export { routes };
