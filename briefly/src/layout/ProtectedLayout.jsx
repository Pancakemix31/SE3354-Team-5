import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from './MainLayout';

/**
 * Wraps the main shell; unauthenticated users are sent to /login.
 * Teammates rarely need to edit this — add public routes in AppRoutes if needed later.
 */
function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default ProtectedLayout;
