import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AUTH_LAYOUT_ROUTES, MAIN_LAYOUT_ROUTES } from '../config/routes.config';
import AuthLayout from '../layout/AuthLayout';
import ProtectedLayout from '../layout/ProtectedLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedLayout />}>
        {MAIN_LAYOUT_ROUTES.map((r) =>
          r.index ? (
            <Route key="index" index element={<r.Component />} />
          ) : (
            <Route key={r.path} path={r.path} element={<r.Component />} />
          )
        )}
      </Route>
      {AUTH_LAYOUT_ROUTES.map((r) => (
        <Route key={r.path} path={`/${r.path}`} element={<AuthLayout />}>
          <Route index element={<r.Component />} />
        </Route>
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
