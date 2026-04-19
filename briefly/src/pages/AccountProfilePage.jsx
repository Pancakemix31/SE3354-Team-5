import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/featurePages.css';

export default function AccountProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [digestFrequency, setDigestFrequency] = useState('1d');
  const [summaryDepth, setSummaryDepth] = useState('concise');
  const [toast, setToast] = useState('');

  function normalizeFrequency(value) {
    if (value === 'hourly') return '1h';
    if (value === 'daily') return '1d';
    return ['30m', '1h', '6h', '12h', '1d'].includes(value) ? value : '1d';
  }

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setDigestFrequency(normalizeFrequency(user.digestFrequency));
    setSummaryDepth(user.summaryDepth === 'deep' ? 'deep' : 'concise');
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    const result = updateProfile({
      name,
      digestFrequency,
      summaryDepth,
    });
    if (result.ok) {
      setToast('Account preferences saved.');
      window.setTimeout(() => setToast(''), 2400);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="feature-page">
        <header className="feature-page__header">
          <h1>Account</h1>
          <p>Update how you appear and how deep your AI briefings go.</p>
        </header>
        <div className="feature-page__gate">
          <p>Sign in to manage your account preferences.</p>
          <div className="feature-page__gate-actions">
            <Link className="home__btn home__btn--primary" to="/login">
              Sign in
            </Link>
            <Link className="home__btn home__btn--secondary" to="/register">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>Account preferences</h1>
        <p>Display name, digest cadence, and summary depth sync to this browser profile.</p>
      </header>
      {toast ? (
        <p className="feature-toast" role="status">
          {toast}
        </p>
      ) : null}
      <form className="pref-section" onSubmit={handleSubmit}>
        <div className="stack-field">
          <label htmlFor="acct-name">Display name</label>
          <input
            id="acct-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="stack-field">
          <label htmlFor="acct-email">Email</label>
          <input id="acct-email" value={user.email} readOnly />
        </div>
        <div className="stack-field">
          <label htmlFor="acct-digest">Digest frequency</label>
          <select
            id="acct-digest"
            value={digestFrequency}
            onChange={(e) => setDigestFrequency(e.target.value)}
          >
            <option value="30m">Every 30 minutes</option>
            <option value="1h">Every 1 hour</option>
            <option value="6h">Every 6 hours</option>
            <option value="12h">Every 12 hours</option>
            <option value="1d">Every 1 day</option>
          </select>
        </div>
        <div className="stack-field">
          <label htmlFor="acct-depth">AI summary depth</label>
          <select
            id="acct-depth"
            value={summaryDepth}
            onChange={(e) => setSummaryDepth(e.target.value)}
          >
            <option value="concise">Concise — headline + 3 bullets</option>
            <option value="deep">Deep — context, risks, and sources</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Save account preferences
        </button>
      </form>
    </div>
  );
}
