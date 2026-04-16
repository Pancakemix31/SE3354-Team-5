import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

/**
 * Basic account overview: name, email, verification, saved preferences summary.
 */
function ProfilePage() {
  const { user, preferences, isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="profile-page profile-page--loading">
        <p className="profile-page__loading">Loading profile…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const topics = preferences?.topics ?? [];
  const regions = preferences?.regions ?? [];

  return (
    <div className="profile-page">
      <div className="profile-page__intro">
        <h1>Your profile</h1>
        <p>Account details and topic/region preferences from your Briefly profile.</p>
      </div>

      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__avatar" aria-hidden="true">
            {(user.name?.trim() || user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="profile-card__name">{user.name || 'No display name'}</h2>
            <p className="profile-card__email">{user.email}</p>
          </div>
          <span
            className={`profile-card__badge${user.emailVerified ? ' profile-card__badge--ok' : ''}`}
          >
            {user.emailVerified ? 'Email verified' : 'Email not verified'}
          </span>
        </div>

        <dl className="profile-card__meta">
          <div className="profile-card__row">
            <dt>User ID</dt>
            <dd>
              <code className="profile-card__uid">{user.uid}</code>
            </dd>
          </div>
          <div className="profile-card__row">
            <dt>News topics</dt>
            <dd>
              {topics.length ? (
                <ul className="profile-card__tags">
                  {topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <span className="profile-card__empty">None set yet</span>
              )}
            </dd>
          </div>
          <div className="profile-card__row">
            <dt>Regions</dt>
            <dd>
              {regions.length ? (
                <ul className="profile-card__tags">
                  {regions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : (
                <span className="profile-card__empty">None set yet</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="profile-card__actions">
          <Link to="/settings" className="profile-page__link">
            Notification settings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
