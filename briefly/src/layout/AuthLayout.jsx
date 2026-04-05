import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Link to="/" className="auth-layout__brand">
        Briefly
      </Link>
      <div className="auth-layout__card">
        <Outlet />
      </div>
    </div>
  );
}
