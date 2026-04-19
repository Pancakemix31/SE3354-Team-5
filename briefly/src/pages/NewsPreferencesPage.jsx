import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadNewsPreferences, saveNewsPreferences } from '../lib/newsPreferencesStorage';
import '../styles/featurePages.css';

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

export default function NewsPreferencesPage() {
  const { user, isAuthenticated } = useAuth();
  const [selected, setSelected] = useState(new Set(DEFAULTS.categories));
  const [region, setRegion] = useState(DEFAULTS.region);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadPrefs = async () => {
      setLoading(true);
      const loaded = await loadNewsPreferences(user.uid);
      setSelected(new Set(loaded.categories));
      setRegion(loaded.region);
      setLoading(false);
    };

    loadPrefs();
  }, [user?.uid]);

  function toggle(cat) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user?.uid) return;
    if (selected.size === 0) return;

    setSaving(true);
    const success = await saveNewsPreferences(user.uid, {
      categories: Array.from(selected),
      region,
    });
    setSaving(false);

    setToast(success ? 'News preferences updated.' : 'Failed to save preferences. Please try again.');
    window.setTimeout(() => setToast(''), 2400);
  }

  if (!isAuthenticated) {
    return (
      <div className="feature-page">
        <header className="feature-page__header">
          <h1>News preferences</h1>
          <p>Choose categories and regions so briefings lean toward what you care about.</p>
        </header>
        <div className="feature-page__gate">
          <p>Create an account or sign in to save preferences on this device.</p>
          <div className="feature-page__gate-actions">
            <Link className="home__btn home__btn--primary" to="/register">
              Register
            </Link>
            <Link className="home__btn home__btn--secondary" to="/login">
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="feature-page">
        <header className="feature-page__header">
          <h1>News preferences</h1>
          <p>Loading your saved preferences...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>News preferences</h1>
        <p>Categories and regions drive ranking and digest composition. At least one category is required.</p>
      </header>
      {toast ? (
        <p className="feature-toast" role="status">
          {toast}
        </p>
      ) : null}
      <form onSubmit={handleSave}>
        <section className="pref-section">
          <h2>Categories</h2>
          <div className="chip-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip${selected.has(cat) ? ' chip--on' : ''}`}
                onClick={() => toggle(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
        <section className="pref-section">
          <h2>Region focus</h2>
          <div className="stack-field">
            <label htmlFor="news-region">Primary region</label>
            <select
              id="news-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </section>
        <button type="submit" className="btn-primary" disabled={selected.size === 0 || saving}>
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
      </form>
    </div>
  );
}
