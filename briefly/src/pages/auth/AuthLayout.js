import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import './AuthPage.css';

/**
 * Split auth layout — editorial promo rail + glass form panel.
 */
function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-page">
      <div className="auth-page__backdrop" aria-hidden="true" />
      <div className="auth-page__split">
        <aside className="auth-page__promo">
          <Link to="/" className="auth-page__promo-brand">
            <Logo height={40} className="auth-page__promo-logo" />
            <span>Briefly</span>
          </Link>
          <p className="auth-page__promo-eyebrow">AI-native news desk</p>
          <h2 className="auth-page__promo-title">Briefings that respect your attention.</h2>
          <p className="auth-page__promo-lead">
            Ranked global coverage, preference-aware digests, and one-tap summaries — tuned for how
            you actually read.
          </p>
          <ul className="auth-page__promo-list">
            <li>Live trending radar across regions</li>
            <li>Explicit ratings that steer your feed</li>
            <li>Topics &amp; regions you control</li>
          </ul>
          <Link className="auth-page__promo-back" to="/">
            ← Back to product home
          </Link>
        </aside>
        <div className="auth-page__panel-outer">
          <div className="auth-page__panel">
            <div className="auth-page__panel-brand-row">
              <Link to="/" className="auth-page__brand auth-page__brand--compact">
                <Logo height={44} className="auth-page__logo" />
                <span className="auth-page__brand-name">Briefly</span>
              </Link>
            </div>
            {title ? <h1 className="auth-page__title">{title}</h1> : null}
            {subtitle ? <p className="auth-page__subtitle">{subtitle}</p> : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
