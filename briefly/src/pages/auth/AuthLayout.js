import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import './AuthPage.css';

/**
 * Centered auth experience (login / register) with brand header — no main navbar.
 */
function AuthLayout({ children, title, subtitle, showBackLink = false, showBrandName = false }) {
  return (
    <div className="auth-page">
      <div className="auth-page__backdrop" aria-hidden="true" />
      <div className="auth-page__panel">
        <Link to="/" className="auth-page__brand">
          <Logo height={52} className="auth-page__logo" />
          {showBrandName ? <span className="auth-page__brand-name">Briefly</span> : null}
        </Link>
        {title ? <h1 className="auth-page__title">{title}</h1> : null}
        {subtitle ? <p className="auth-page__subtitle">{subtitle}</p> : null}
        {children}
        {showBackLink ? (
          <p className="auth-page__footer-note">
            <Link to="/">Back to home</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default AuthLayout;
