import React, { useState, useCallback } from 'react';
import Logo from '../components/Logo';
import './SummaryPage.css';

/** Simulated latency so loading state feels realistic (no network call). */
const SUMMARY_DELAY_MS = 900;

/** Fixed mock output — replace with an API response in production. */
const MOCK_SUMMARY =
  'Researchers are piloting machine-learning cooling controls in data centers to cut ' +
  'power use during peak periods. Early results are positive, with broader trials planned ' +
  'before wider adoption by cloud operators.';

/**
 * AI Summary flow: article + generate button + loading + animated summary card.
 */
function SummaryPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showCard, setShowCard] = useState(false);

  const runSummary = useCallback(() => {
    setLoading(true);
    setShowCard(false);
    setSummary('');

    window.setTimeout(() => {
      setSummary(MOCK_SUMMARY);
      setLoading(false);
      setShowCard(true);
    }, SUMMARY_DELAY_MS);
  }, []);

  return (
    <div className="summary-page">
      <header className="summary-page__intro">
        <h1>Featured story</h1>
        <p>Generate a concise digest without leaving the page.</p>
      </header>

      <article className="article-card" aria-labelledby="article-title">
        <div className="article-card__hero" aria-hidden="true" />
        <div className="article-card__body">
          <p className="article-card__meta">Technology · Sustainability</p>
          <h2 id="article-title" className="article-card__title">
            Data centers trial smarter cooling to trim energy use
          </h2>
          <p className="article-card__text">
            University researchers announced a new approach to reducing energy use in data
            centers by optimizing cooling systems with machine learning. Early trials showed
            a measurable drop in power consumption during peak hours. The team plans wider
            testing next year and hopes the method can be adopted by cloud providers to
            support more sustainable computing.
          </p>
          <div className="summary-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={runSummary}
              disabled={loading}
              aria-busy={loading}
            >
              {loading && <span className="btn-primary__spinner" aria-hidden="true" />}
              {loading ? 'Generating…' : 'Generate Summary'}
            </button>
            {loading && (
              <div className="summary-loading-mark" aria-hidden="true">
                <Logo height={36} className="logo-img--pulse" />
              </div>
            )}
          </div>
        </div>
      </article>

      {showCard && (
        <section className="summary-result summary-result--visible" aria-live="polite">
          <div className="summary-result__label">
            <span>Summary</span>
            <span className="summary-result__tag">AI</span>
          </div>
          <p className="summary-result__text">{summary}</p>
        </section>
      )}

      <p className="page-use-case-credit">Faris Suleiman</p>
    </div>
  );
}

export default SummaryPage;
