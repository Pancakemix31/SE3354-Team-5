import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Navbar.css';

/**
 * Product navigation + auth actions. Add new top-level links here when features ship.
 */
function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" end>
          <Logo height={40} className="navbar__logo-img" />
          <span className="navbar__wordmark">Briefly</span>
        </NavLink>
        <nav className="navbar__links" aria-label="Main">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Home
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
            to="/settings"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Settings
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Team hub
          </NavLink>
        </nav>
        <div className="navbar__auth">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="navbar__user navbar__user-link"
                title={user.email ? `${user.name || 'Account'} · ${user.email}` : undefined}
              >
                {user.name || user.email?.split('@')[0] || 'Account'}
              </Link>
              <button type="button" className="navbar__btn navbar__btn--ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                Sign in
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
