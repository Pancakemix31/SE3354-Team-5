import { Link } from 'react-router-dom';
import './HomePage.css';

/**
 * Landing hub with cards linking to the summary and settings flows.
 */
export default function HomePage() {
  return (
    <>
      <div className="page-hero hub-hero">
        <div className="page-hero__inner">
          <p className="use-case-eyebrow">
            <span className="use-case-badge hub-badge--alt">Project hub</span>
            <span className="use-case-label">Software Engineering class deliverable</span>
          </p>
          <h1>Two interactive experiences, one cohesive product</h1>
          <p className="hero-lead">
            <strong>Name: Faris Suleiman.</strong> Below are the two required flows—now running as
            a React app—styled like a small professional news product called Briefly Wire.
          </p>
        </div>
      </div>

      <main className="site-main" id="main-content">
        <div className="main-inner">
          <div className="hub-cards">
            <Link className="hub-card" to="/summary">
              <span className="use-case-badge hub-card__badge">Use case 1</span>
              <h2>View AI Summary</h2>
              <p>
                Read a sample article and generate a simulated AI summary with a short loading
                state.
              </p>
              <span className="hub-card__cta">Open article experience →</span>
            </Link>
            <Link className="hub-card" to="/settings">
              <span className="use-case-badge hub-card__badge">Use case 2</span>
              <h2>Modify notification settings</h2>
              <p>
                Toggle alerts, pick Hourly or Daily frequency, see confirmations, and persist
                choices with localStorage.
              </p>
              <span className="hub-card__cta">Open settings →</span>
            </Link>
          </div>
          <p className="hub-meta">
            Blue and white theme · Rounded surfaces · Soft shadows · React + Vite
          </p>
        </div>
      </main>
    </>
  );
}
