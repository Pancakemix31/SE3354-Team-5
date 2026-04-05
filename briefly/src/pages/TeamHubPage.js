import React from 'react';
import { Link } from 'react-router-dom';
import './TeamHubPage.css';

/**
 * Teammate onboarding hub — documents how to plug in new routes and features.
 * Pair with `src/features/featureRoutes.js` when adding screens.
 */
function TeamHubPage() {
  return (
    <div className="team-hub">
      <header className="team-hub__hero">
        <p className="team-hub__eyebrow">Team foundation</p>
        <h1>Extend Briefly with your use cases</h1>
        <p className="team-hub__lead">
          Core flows already live below. Add your route in <code>App.js</code> (or{' '}
          <code>featureRoutes.js</code>) and drop a new page under <code>src/pages/</code> or{' '}
          <code>src/features/your-name/</code>.
        </p>
      </header>

      <section className="team-hub__grid" aria-label="Shipped features">
        <Link className="team-hub__card team-hub__card--live" to="/summary">
          <span className="team-hub__badge team-hub__badge--live">Live</span>
          <h2>AI Summary</h2>
          <p>Article reader with simulated summary generation.</p>
          <span className="team-hub__cta">Open →</span>
        </Link>
        <Link className="team-hub__card team-hub__card--live" to="/settings">
          <span className="team-hub__badge team-hub__badge--live">Live</span>
          <h2>Notification settings</h2>
          <p>Toggle + frequency with local persistence.</p>
          <span className="team-hub__cta">Open →</span>
        </Link>
        <div className="team-hub__card team-hub__card--placeholder">
          <span className="team-hub__badge">Your feature</span>
          <h2>Add route + page</h2>
          <p>
            Create <code>src/features/&lt;teammate&gt;/YourPage.js</code>, export it, and register a{' '}
            <code>&lt;Route&gt;</code>.
          </p>
        </div>
      </section>

      <section className="team-hub__steps" aria-labelledby="team-steps-heading">
        <h2 id="team-steps-heading">Checklist for new screens</h2>
        <ol>
          <li>Add a folder under <code>src/features/&lt;your-name&gt;/</code> (keeps ownership clear).</li>
          <li>
            Create a page component and import it in <code>src/App.js</code> inside{' '}
            <code>MainLayout</code> routes.
          </li>
          <li>
            Optional: export metadata from <code>src/features/featureRoutes.js</code> for discovery.
          </li>
          <li>
            Add a <code>NavLink</code> in <code>Navbar.js</code> if the feature is top-level.
          </li>
        </ol>
      </section>

      <section className="team-hub__snippet" aria-label="Example route snippet">
        <h2>Example route registration</h2>
        <pre className="team-hub__pre" tabIndex={0}>
{`// App.js — inside <Route element={<MainLayout />}> …
<Route path="/your-path" element={<YourPage />} />`}
        </pre>
      </section>
    </div>
  );
}

export default TeamHubPage;
