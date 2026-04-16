import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './HomePage.css';

/**
 * Marketing home — hero, logo, CTAs, shipped features, teammate entry point.
 */
function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="home__hero-band">
        <div className="home__hero-inner">
          <div className="home__hero-logo-wrap">
            <Logo height={88} className="home__hero-logo" />
          </div>
          <p className="home__hero-eyebrow">News, distilled</p>
          <h1>Read what matters. Skip what does not.</h1>
          <p className="home__lead">
            Briefly is a startup-style reader: pull instant AI summaries, tune notifications, and
            build on a clean React foundation your team can extend.
          </p>
          <div className="home__cta-row">
            {!isAuthenticated ? (
              <>
                <Link className="home__btn home__btn--primary" to="/register">
                  Get started
                </Link>
                <Link className="home__btn home__btn--secondary" to="/login">
                  Sign in
                </Link>
              </>
            ) : null}
            <Link className="home__btn home__btn--link" to="/team">
              Team hub →
            </Link>
          </div>
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Shipped experiences</h2>
        <p className="home__section-desc">
          Core flows are live today. Clone patterns from these pages when you add your own routes.
        </p>
        <div className="home__grid">
          <Link className="home__card" to="/summary">
            <h2>AI Summary</h2>
            <p>
              Featured article with one-click digest and a subtle branded loading state—swap the
              mock for your API when ready.
            </p>
            <span className="home__card-cta">Open AI Summary →</span>
          </Link>
          <Link className="home__card" to="/settings">
            <h2>Notification settings</h2>
            <p>
              Toggle alerts and pick Hourly or Daily digests. Preferences persist locally until you
              wire a backend.
            </p>
            <span className="home__card-cta">Open settings →</span>
          </Link>
          <Link className="home__card home__card--accent" to="/team">
            <h2>Build the next feature</h2>
            <p>
              Checklist, folder conventions, and a placeholder card reserved for upcoming team use
              cases.
            </p>
            <span className="home__card-cta">Team hub →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
