import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import '../styles/featurePages.css';
import '../pages/SettingsPage.css';

const STORAGE_ENABLED = 'briefly_notifications_enabled';

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

const CATEGORIES = ['Finance', 'World', 'Politics', 'Technology', 'Science', 'Culture'];
const REGIONS = [
  'North America',
  'Europe',
  'Middle East',
  'Asia Pacific',
  'Latin America',
  'Africa',
  'Global',
];
const DEFAULTS = {
  categories: ['Technology', 'World'],
  region: 'Global',
};

export default function AccountProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [digestFrequency, setDigestFrequency] = useState('1d');
  const [summaryDepth, setSummaryDepth] = useState('concise');
  const [selectedCategories, setSelectedCategories] = useState(new Set(DEFAULTS.categories));
  const [region, setRegion] = useState(DEFAULTS.region);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    readStorage(STORAGE_ENABLED) === 'true'
  );

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
    setSelectedCategories(
      new Set(Array.isArray(user.newsCategories) && user.newsCategories.length > 0
        ? user.newsCategories
        : DEFAULTS.categories)
    );
    setRegion(user.newsRegion || DEFAULTS.region);

    const syncNotificationSetting = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (typeof data.notificationsEnabled === 'boolean') {
            setNotificationsEnabled(data.notificationsEnabled);
            writeStorage(STORAGE_ENABLED, data.notificationsEnabled ? 'true' : 'false');
          }
        }
      } catch (error) {
        console.error('Failed to load email notification preference:', error);
      }
    };

    syncNotificationSetting();
  }, [user]);

  const handleNotificationToggle = (e) => {
    const next = e.target.checked;
    setNotificationsEnabled(next);
    writeStorage(STORAGE_ENABLED, next ? 'true' : 'false');
  };

  function toggleCategory(category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function handleAddCustomTopic() {
    const trimmed = customTopic.trim();
    if (!trimmed) return;
    
    setSelectedCategories((prev) => new Set([...prev, trimmed]));
    setCustomTopic('');
    setShowAddModal(false);
  }

  function handleRemoveCustomTopic(topic) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.delete(topic);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedCategories.size === 0) return;

    setSaving(true);
    const result = await updateProfile({
      name,
      digestFrequency,
      summaryDepth,
      newsCategories: Array.from(selectedCategories),
      newsRegion: region,
      notificationsEnabled,
    });
    setSaving(false);

    if (result.ok) {
      setToast('Account preferences saved.');
    } else {
      setToast(result.error || 'Unable to save account preferences.');
    }
    window.setTimeout(() => setToast(''), 2400);
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
        <p>Update your display name, digest cadence, summary depth, and news topics from one page.</p>
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
          <label>Email notifications</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                gap: '0.5rem',
              }}
            >
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '52px',
                  height: '28px',
                  background: notificationsEnabled ? '#10b981' : '#e5e7eb',
                  borderRadius: '14px',
                  transition: 'background 0.25s ease',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    content: '""',
                    position: 'absolute',
                    height: '22px',
                    width: '22px',
                    left: notificationsEnabled ? '27px' : '3px',
                    bottom: '3px',
                    background: '#f1f5f9',
                    borderRadius: '50%',
                    transition: 'left 0.25s ease',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                  }}
                />
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                {notificationsEnabled ? 'On' : 'Off'}
              </span>
            </label>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            News update notifications will be sent to your email
          </p>
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
        <section className="pref-section">
          <h2>News topics</h2>
          <p>Pick the categories you want Briefly to prioritize.</p>
          <div className="chip-row">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip${selectedCategories.has(category) ? ' chip--on' : ''}`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
            ))}
            <button
              type="button"
              className="chip chip--add"
              onClick={() => setShowAddModal(true)}
              title="Add custom topic"
            >
              Add +
            </button>
          </div>
          {Array.from(selectedCategories)
            .filter((cat) => !CATEGORIES.includes(cat))
            .length > 0 && (
            <div className="custom-topics">
              <h3>Custom topics</h3>
              <div className="chip-row">
                {Array.from(selectedCategories)
                  .filter((cat) => !CATEGORIES.includes(cat))
                  .map((customCat) => (
                    <div key={customCat} className="chip chip--custom">
                      {customCat}
                      <button
                        type="button"
                        className="chip__remove"
                        onClick={() => handleRemoveCustomTopic(customCat)}
                        aria-label={`Remove ${customCat}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Add custom topic</h3>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g., Cryptocurrency, Space, Gaming"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddCustomTopic();
                  }}
                  autoFocus
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setCustomTopic('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleAddCustomTopic}
                    disabled={!customTopic.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
        <section className="pref-section">
          <h2>Region focus</h2>
          <div className="stack-field">
            <label htmlFor="acct-region">Primary region</label>
            <select
              id="acct-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((regionOption) => (
                <option key={regionOption} value={regionOption}>
                  {regionOption}
                </option>
              ))}
            </select>
          </div>
        </section>
        <button type="submit" className="btn-primary" disabled={selectedCategories.size === 0 || saving}>
          {saving ? 'Saving...' : 'Save account preferences'}
        </button>
      </form>

      <section className="pref-section pref-section--danger">
        <h2>Danger zone</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Permanently remove your account and all saved data. This cannot be undone.
        </p>
        <Link to="/account/delete" className="btn-danger" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Delete account
        </Link>
      </section>
    </div>
  );
}

