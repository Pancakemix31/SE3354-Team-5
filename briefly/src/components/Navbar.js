import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Navbar.css';

/**
 * Full app navigation — only rendered inside authenticated routes (MainLayout).
 */
function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/news" className="navbar__brand">
          <Logo height={48} className="navbar__logo-img" />
          <span className="navbar__wordmark">Briefly</span>
        </NavLink>
        <nav className="navbar__links" aria-label="Main">
          <NavLink
            to="/news"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            News
          </NavLink>
          <NavLink
            to="/summary"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            AI Summary
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Saved
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Account
          </NavLink>
        </nav>
        <div className="navbar__auth">
          <span className="navbar__user" title={user.email}>
            {user.name?.split(' ')[0] || 'Reader'}
          </span>
          <button type="button" className="navbar__btn navbar__btn--ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
