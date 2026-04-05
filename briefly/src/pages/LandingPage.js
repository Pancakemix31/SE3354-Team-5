import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './HomePage.css';

function LandingPage() {
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
            Briefly is a reader for busy people: pull instant AI summaries, browse trending global
            news, and focus on the stories you care about.
          </p>
          <div className="home__cta-row">
            <Link className="home__btn home__btn--primary" to="/register">
              Get started
            </Link>
            <Link className="home__btn home__btn--secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">What you can do</h2>
        <p className="home__section-desc">
          Summaries, trending global news, saved articles, and notification preferences ready to
          use when you are signed in.
        </p>
        <div className="home__grid">
          <Link className="home__card" to="/trending">
            <h2>Trending global news</h2>
            <p>
              Browse globally trending stories ranked by engagement, then open a story for its
              full summary and publication details.
            </p>
            <span className="home__card-cta">Open trending -&gt;</span>
          </Link>
          <Link className="home__card" to="/summary">
            <h2>AI Summary</h2>
            <p>
              Open a featured article, generate a one-click digest, and follow along with a smooth
              loading experience.
            </p>
            <span className="home__card-cta">Open AI Summary -&gt;</span>
          </Link>
          <Link className="home__card" to="/saved">
            <h2>Saved articles</h2>
            <p>
              Save stories from the AI Summary page and revisit them anytime from your personal list.
            </p>
            <span className="home__card-cta">View saved -&gt;</span>
          </Link>
          <Link className="home__card" to="/settings">
            <h2>Notification settings</h2>
            <p>
              Toggle alerts and pick Hourly or Daily digests. Your choices are saved on this device.
            </p>
            <span className="home__card-cta">Open settings -&gt;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
