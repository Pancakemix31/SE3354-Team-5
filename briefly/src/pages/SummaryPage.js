import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { SAMPLE_ARTICLES } from '../data/sampleArticles';
import './SummaryPage.css';

/** Simulated latency so loading state feels realistic (no network call). */
const SUMMARY_DELAY_MS = 900;

/**
 * AI Summary flow: article selection + article + generate button + loading + animated summary card.
 */
function SummaryPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { saveArticle, isSaved } = useSavedArticles();
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem('articleRatings');
    return saved ? JSON.parse(saved) : {};
  });
  const toastTimer = useRef(null);

  const selectedArticle = SAMPLE_ARTICLES[selectedArticleIndex];

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
    const result = saveArticle(selectedArticle);
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
  }, [isAuthenticated, navigate, saveArticle, showToast, selectedArticle]);

  const runSummary = useCallback(() => {
    setLoading(true);
    setShowCard(false);
    setSummary('');

    window.setTimeout(() => {
      setSummary(selectedArticle.summary);
      setLoading(false);
      setShowCard(true);
    }, SUMMARY_DELAY_MS);
  }, [selectedArticle]);

  const handleRating = useCallback((articleId, rating) => {
    const newRatings = { ...ratings, [articleId]: rating };
    setRatings(newRatings);
    localStorage.setItem('articleRatings', JSON.stringify(newRatings));
    showToast(`Rated ${rating} star${rating !== 1 ? 's' : ''}!`);
  }, [ratings, showToast]);

  return (
    <div className="summary-page">
      <header className="summary-page__intro">
        <h1>AI Summary</h1>
        <p>Choose a sample article and generate a concise digest without leaving the page.</p>
        <div className="article-selector">
          <label htmlFor="article-select">Select an article:</label>
          <select
            id="article-select"
            value={selectedArticleIndex}
            onChange={(e) => setSelectedArticleIndex(parseInt(e.target.value))}
          >
            {SAMPLE_ARTICLES.map((article, index) => (
              <option key={article.id} value={index}>
                {article.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <article className="article-card" aria-labelledby="article-title">
        <div className="article-card__hero" aria-hidden="true" />
        <div className="article-card__body">
          <p className="article-card__meta">{selectedArticle.category}</p>
          <h2 id="article-title" className="article-card__title">
            {selectedArticle.title}
          </h2>
          <div className="article-rating">
            <span className="article-rating__label">Rate this article:</span>
            <div className="article-rating__stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${ratings[selectedArticle.id] >= star ? 'star--filled' : ''}`}
                  onClick={() => handleRating(selectedArticle.id, star)}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            {ratings[selectedArticle.id] && (
              <span className="article-rating__value">
                {ratings[selectedArticle.id]} star{ratings[selectedArticle.id] !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="article-card__text">
            {selectedArticle.content}
          </p>
          <div className="summary-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onSaveArticle}
              disabled={isSaved(selectedArticle.id)}
              aria-pressed={isSaved(selectedArticle.id)}
            >
              {isSaved(selectedArticle.id) ? 'Saved' : 'Save article'}
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
