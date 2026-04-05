import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { FEATURED_ARTICLE } from '../data/articles';
import './SummaryPage.css';

const SUMMARY_DELAY_MS = 900;

const MOCK_SUMMARY =
  'Researchers are piloting machine-learning cooling controls in data centers to cut ' +
  'power use during peak periods. Early results are positive, with broader trials planned ' +
  'before wider adoption by cloud operators.';

function ReadingListSummaryPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { saveArticle, isSaved } = useSavedArticles();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

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
      showToast('This article is already in your reading list.');
      return;
    }
    if (result.queued) {
      showToast('You are offline. This save will sync automatically when you reconnect.');
      return;
    }
    if (result.ok) {
      showToast('Article added to your reading list.');
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
        <p>Save it for later, or open the full article to read the complete story.</p>
      </header>

      <article className="article-card" aria-labelledby="article-title">
        <div className="article-card__hero" aria-hidden="true" />
        <div className="article-card__body">
          <p className="article-card__meta">{FEATURED_ARTICLE.category}</p>
          <h2 id="article-title" className="article-card__title">
            {FEATURED_ARTICLE.title}
          </h2>
          <p className="article-card__text">
            {FEATURED_ARTICLE.excerpt} Early trials showed a measurable drop in power consumption
            during peak hours. The team plans wider testing next year and hopes the method can be
            adopted by cloud providers to support more sustainable computing.
          </p>
          <p className="article-card__source">
            {FEATURED_ARTICLE.source} | {FEATURED_ARTICLE.readTime}
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
              {loading ? 'Generating...' : 'Generate Summary'}
            </button>
            <Link className="summary-link" to={`/articles/${FEATURED_ARTICLE.id}`}>
              Open full article
            </Link>
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

      <p className="page-use-case-credit">AI Summary and Reading List</p>
    </div>
  );
}

export default ReadingListSummaryPage;
