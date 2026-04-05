import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainNav from './MainNav';
import './MainLayout.css';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__header-row">
          <div>
            <Link to="/" className="main-layout__brand">
              Briefly
            </Link>
            <p className="main-layout__tagline">Credible news, byte-sized.</p>
          </div>
          <div className="main-layout__user">
            <span className="main-layout__email" title={user?.email}>
              {user?.email}
            </span>
            <button type="button" className="main-layout__logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="main-layout__body">
        <aside className="main-layout__sidebar">
          <MainNav />
        </aside>
        <main className="main-layout__main">{children}</main>
      </div>
    </div>
  );
}
