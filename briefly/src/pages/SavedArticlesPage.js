import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import './SavedArticlesPage.css';

function SavedArticlesPage() {
  const { isAuthenticated } = useAuth();
  const { savedArticles, removeArticle, pendingCount, isOnline } = useSavedArticles();

  if (!isAuthenticated) {
    return (
      <div className="saved-page">
        <header className="saved-page__intro">
          <h1>Saved articles</h1>
          <p>Sign in to view and manage articles you have saved.</p>
        </header>
        <div className="saved-page__gate">
          <p>You need an account to use saved articles on this device.</p>
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
        <h1>Saved articles</h1>
        <p>Articles you saved from Briefly. Remove any item to take it off this list.</p>
      </header>

      {!isOnline && (
        <div className="saved-page__banner" role="status">
          You are offline. Saved items stay on this device; new saves may be queued until you are
          back online.
        </div>
      )}

      {pendingCount > 0 && (
        <div className="saved-page__banner saved-page__banner--pending" role="status">
          {pendingCount} save{pendingCount === 1 ? '' : 's'} waiting to sync when you are online.
        </div>
      )}

      {savedArticles.length === 0 ? (
        <div className="saved-page__empty">
          <p>No saved articles yet.</p>
          <p className="saved-page__empty-hint">
            Open <Link to="/summary">Featured News</Link> and use <strong>Save article</strong> on a
            story you want to keep.
          </p>
        </div>
      ) : (
        <ul className="saved-page__list" aria-label="Saved articles">
          {savedArticles.map((article) => (
            <li key={article.id} className="saved-card">
              <div className="saved-card__body">
                {article.category ? (
                  <p className="saved-card__meta">{article.category}</p>
                ) : null}
                <h2 className="saved-card__title">{article.title}</h2>
                <p className="saved-card__excerpt">{article.excerpt}</p>
                <p className="saved-card__date">
                  Saved{' '}
                  {new Date(article.savedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div className="saved-card__actions">
                <button
                  type="button"
                  className="saved-card__remove"
                  onClick={() => removeArticle(article.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavedArticlesPage;
