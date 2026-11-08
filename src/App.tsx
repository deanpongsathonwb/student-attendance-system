import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routesConfig } from './routes';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

const router = createBrowserRouter(routesConfig);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
