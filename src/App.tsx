import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routesConfig } from './routes';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { ensureTopLevelNavigation } from './security/clickjacking/frameProtection';

const router = createBrowserRouter(routesConfig);

export const App: React.FC = () => {
  useEffect(() => {
    ensureTopLevelNavigation();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
