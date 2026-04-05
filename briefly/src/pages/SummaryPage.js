import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { FEATURED_ARTICLE } from '../data/featuredArticle';
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { saveArticle, isSaved } = useSavedArticles();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((message) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    setToastVisible(true);
    toastTimer.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  }, []);

  const onSaveArticle = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/summary' },
          message: 'Sign in to save articles to your list.',
        },
      });
      return;
    }
    const result = saveArticle(FEATURED_ARTICLE);
    if (result.needAuth) {
      navigate('/login', {
        state: {
          from: { pathname: '/summary' },
          message: 'Sign in to save articles to your list.',
        },
      });
      return;
    }
    if (result.duplicate) {
      showToast('This article is already in your saved list.');
      return;
    }
    if (result.queued) {
      showToast('You appear to be offline. Save is queued and will finish when you are back online.');
      return;
    }
    if (result.ok) {
      showToast('Article saved to your list.');
      return;
    }
    if (result.error) {
      showToast(result.error);
    }
  }, [isAuthenticated, navigate, saveArticle, showToast]);

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
              className="btn-secondary"
              onClick={onSaveArticle}
              disabled={isSaved(FEATURED_ARTICLE.id)}
              aria-pressed={isSaved(FEATURED_ARTICLE.id)}
            >
              {isSaved(FEATURED_ARTICLE.id) ? 'Saved' : 'Save article'}
            </button>
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
          <div
            className={`summary-toast${toastVisible ? ' summary-toast--visible' : ''}`}
            role="status"
            aria-live="polite"
          >
            {toast}
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

      <p className="page-use-case-credit">
        AI Summary · Faris Suleiman · Save article · Ridwan
      </p>
    </div>
  );
}

export default SummaryPage;
