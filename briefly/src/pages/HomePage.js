import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './HomePage.css';

/** Public landing — matches app-wide light theme; larger logo, modern hero. */
function HomePage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/news" replace />;
  }

  return (
    <div className="home home--landing">
      <div className="landing__mesh" aria-hidden />
      <div className="landing__orb landing__orb--a" aria-hidden />
      <div className="landing__orb landing__orb--b" aria-hidden />

      <section className="landing__hero">
        <div className="landing__inner">
          <div className="landing__logo-shell">
            <div className="landing__logo-glow" aria-hidden />
            <div className="landing__logo-card">
              <Logo height={240} className="landing__logo-img" />
            </div>
          </div>

          <p className="landing__brand">Briefly</p>
          <p className="landing__eyebrow">News, distilled</p>

          <h1 className="landing__display">
            Read what <em>matters</em>.
            <span className="landing__display-sub">Skip the noise.</span>
          </h1>

          <ul className="landing__highlights" aria-label="Product highlights">
            <li>Global trending</li>
            <li>Preference-aware</li>
            <li>One-tap digests</li>
          </ul>

          <div className="landing__ctas">
            <Link className="landing__btn landing__btn--solid" to="/register">
              Get started
            </Link>
            <Link className="landing__btn landing__btn--outline" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
