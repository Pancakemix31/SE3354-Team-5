import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TRENDING_ARTICLES } from '../data/trendingNews';
import { loadRatings, saveRating } from '../lib/articleRatingsStorage';
import '../styles/featurePages.css';

export default function RateNewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [toast, setToast] = useState('');
  const [ratings, setRatings] = useState({});
  const toastTimer = useRef(null);

  useEffect(() => {
    setRatings(loadRatings(user?.email));
  }, [user?.email]);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2200);
  }

  function setStars(articleId, stars) {
    if (!user?.email) return;
    saveRating(user.email, articleId, stars);
    setRatings(loadRatings(user.email));
    showToast('Rating saved for this briefing.');
  }

  if (!isAuthenticated) {
    return (
      <div className="feature-page">
        <header className="feature-page__header">
          <h1>Rate coverage</h1>
          <p>Sign in to record how useful each headline was for you. Ratings tune future picks.</p>
        </header>
        <div className="feature-page__gate">
          <p>Sign in to rate stories and personalize your feed.</p>
          <div className="feature-page__gate-actions">
            <Link className="home__btn home__btn--primary" to="/login">
              Sign in
            </Link>
            <Link className="home__btn home__btn--secondary" to="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>Rate news updates</h1>
        <p>
          Quick signal for the ranking model: how well did this update match what you wanted to see?
        </p>
      </header>
      {toast ? (
        <p className="feature-toast" role="status">
          {toast}
        </p>
      ) : null}
      <div className="news-grid">
        {TRENDING_ARTICLES.map((a) => {
          const current = ratings[a.id]?.stars ?? 0;
          return (
            <article key={a.id} className="news-card">
              <div className="news-card__meta">
                <span>{a.category}</span>
                <span>{a.region}</span>
              </div>
              <h2 className="news-card__title">{a.title}</h2>
              <p className="news-card__src">{a.source}</p>
              <p className="news-card__excerpt">{a.excerpt}</p>
              <div className="rate-row">
                <span className="rate-row__label">Your rating</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`rate-star${n <= current ? ' rate-star--on' : ''}`}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    onClick={() => setStars(a.id, n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
