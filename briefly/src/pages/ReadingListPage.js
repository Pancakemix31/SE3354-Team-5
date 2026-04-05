import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import './SavedArticlesPage.css';

// This page is used to add saved articles.
// Created by Saharsh
function ReadingListPage() {
  const { isAuthenticated } = useAuth();
  const { savedArticles, removeArticle, pendingCount, isOnline } = useSavedArticles();
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const showToast = useCallback((message) => {
    window.clearTimeout(hideTimer.current);
    setToast(message);
    setToastVisible(true);
    hideTimer.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="saved-page">
        <header className="saved-page__intro">
          <h1>Reading list</h1>
          <p>Sign in to view and manage the articles you saved for later.</p>
        </header>
        <div className="saved-page__gate">
          <p>You need an account to use your reading list on this device.</p>
          <div className="saved-page__gate-actions">
            <Link className="saved-page__btn saved-page__btn--primary" to="/login">
              Sign in
            </Link>
            <Link className="saved-page__btn saved-page__btn--secondary" to="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <header className="saved-page__intro">
        <h1>Reading list</h1>
        <p>Open any saved story to fetch the full article, or remove it when you are done.</p>
      </header>

      {!isOnline && (
        <div className="saved-page__banner" role="status">
          You are offline. New saves are queued locally and will sync when your connection returns.
        </div>
      )}

      {pendingCount > 0 && (
        <div className="saved-page__banner saved-page__banner--pending" role="status">
          syncReadingList() will retry automatically. {pendingCount} pending save
          {pendingCount === 1 ? '' : 's'} waiting to sync.
        </div>
      )}

      {savedArticles.length === 0 ? (
        <div className="saved-page__empty">
          <p>No saved articles yet.</p>
          <p className="saved-page__empty-hint">
            Open <Link to="/summary">AI Summary</Link> and use <strong>Save article</strong> on a
            story you want to keep.
          </p>
        </div>
      ) : (
        <ul className="saved-page__list" aria-label="Reading list">
          {savedArticles.map((article) => (
            <li key={article.id} className="saved-card">
              <Link className="saved-card__body saved-card__body--link" to={`/articles/${article.id}`}>
                <p className="saved-card__meta">
                  {article.source} {article.category ? `| ${article.category}` : ''}
                </p>
                <h2 className="saved-card__title">{article.title}</h2>
                <p className="saved-card__excerpt">{article.excerpt}</p>
                <p className="saved-card__date">
                  Saved{' '}
                  {new Date(article.savedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </Link>
              <div className="saved-card__actions">
                <Link className="saved-card__open" to={`/articles/${article.id}`}>
                  Open article
                </Link>
                <button
                  type="button"
                  className="saved-card__remove"
                  onClick={() => {
                    removeArticle(article.id);
                    showToast('Article removed from your reading list. Sync updated.');
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        className={`saved-page__toast${toastVisible ? ' saved-page__toast--visible' : ''}`}
        role="status"
      >
        {toast}
      </div>
    </div>
  );
}

export default ReadingListPage;
