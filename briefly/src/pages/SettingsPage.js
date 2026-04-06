import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import NewsPreferencesTab from './NewsPreferencesTab';
import './SettingsPage.css';

const STORAGE_ENABLED = 'briefly_notifications_enabled';
const STORAGE_FREQUENCY = 'briefly_notifications_frequency';

const DEFAULT_ENABLED = false;
const DEFAULT_FREQUENCY = 'daily';

/**
 * Read string from localStorage; returns null if missing or unreadable.
 */
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
    /* private mode / quota — silently ignore */
  }
}

/**
 * Parse saved notification preferences for first paint.
 */
function loadInitialSettings() {
  const enabledRaw = readStorage(STORAGE_ENABLED);
  const freqRaw = readStorage(STORAGE_FREQUENCY);

  const enabled = enabledRaw === 'true';
  const frequency =
    freqRaw === 'hourly' || freqRaw === 'daily' ? freqRaw : DEFAULT_FREQUENCY;

  if (enabledRaw === null && freqRaw === null) {
    return { enabled: DEFAULT_ENABLED, frequency: DEFAULT_FREQUENCY };
  }

  return { enabled, frequency };
}

/**
 * Settings page with tabs for Notifications and News Preferences.
 */
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [{ enabled, frequency }, setState] = useState(loadInitialSettings);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  const showToast = useCallback((message) => {
    window.clearTimeout(hideTimer.current);
    setToast(message);
    setToastVisible(true);
    hideTimer.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  }, []);

  const onToggle = (e) => {
    const next = e.target.checked;
    setState((s) => ({ ...s, enabled: next }));
    writeStorage(STORAGE_ENABLED, next ? 'true' : 'false');
    showToast(next ? 'Notifications enabled.' : 'Notifications disabled.');
  };

  const onFrequency = (e) => {
    const next = e.target.value;
    setState((s) => ({ ...s, frequency: next }));
    writeStorage(STORAGE_FREQUENCY, next);
    const label = next === 'hourly' ? 'Hourly' : 'Daily';
    showToast(`Digest set to ${label}.`);
  };

  return (
    <div className="settings-page">
      <header className="settings-page__intro">
        <h1>Settings</h1>
        <p>Control how Briefly reaches you. Changes apply on this browser immediately.</p>
      </header>

      <div className="settings-layout">
        <aside className="settings-sidebar" aria-label="Sections">
          <h2>Account</h2>
          <ul className="settings-sidebar__nav">
            <li>
              <button
                type="button"
                className={`settings-sidebar__link${activeTab === 'notifications' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`settings-sidebar__link${activeTab === 'preferences' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                News preferences
              </button>
            </li>
            <li>
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `settings-sidebar__link${isActive ? ' is-active' : ''}`
                }
              >
                Saved articles
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/account/delete"
                className={({ isActive }) =>
                  `settings-sidebar__link${isActive ? ' is-active' : ''}`
                }
              >
                Delete account
              </NavLink>
            </li>
          </ul>
        </aside>

        <section className="settings-panel" aria-labelledby={`${activeTab}-heading`}>
          <h2 id={`${activeTab}-heading`}>
            {activeTab === 'notifications' ? 'Notifications' : 'News preferences'}
          </h2>
          <p className="settings-panel__desc">
            {activeTab === 'notifications'
              ? 'Turn alerts on or off and choose how often we bundle updates.'
              : 'Choose which kinds of news matter most, and add custom topics you want to follow.'}
          </p>

          {activeTab === 'notifications' ? (
            <>
              <div className="setting-row">
                <div>
                  <span className="setting-row__label" id="toggle-label">
                    Push notifications
                  </span>
                  <p className="setting-row__help">
                    When enabled, we can surface timely nudges in supported environments.
                  </p>
                </div>
                <div className="toggle">
                  <span className="toggle__state" aria-live="polite">
                    {enabled ? 'ON' : 'OFF'}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={onToggle}
                      aria-labelledby="toggle-label"
                    />
                    <span className="switch__slider" />
                  </label>
                </div>
              </div>

              <div className="setting-row setting-row--stack">
                <div>
                  <label className="setting-row__label" htmlFor="frequency">
                    Digest frequency
                  </label>
                  <p className="setting-row__help">
                    How often we summarize activity into a single update.
                  </p>
                </div>
                <select
                  id="frequency"
                  className="frequency-select"
                  value={frequency}
                  onChange={onFrequency}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </>
          ) : (
            <NewsPreferencesTab showToast={showToast} />
          )}

          <div
            className={`settings-toast${toastVisible ? ' settings-toast--visible' : ''}`}
            role="status"
          >
            {toast}
          </div>

          <p className="settings-footnote">
            Preferences are stored locally in your browser and restored automatically when you
            return.
          </p>
        </section>
      </div>

      <p className="page-use-case-credit">
        {activeTab === 'notifications' ? 'Faris Suleiman' : 'Keshav'}
      </p>
    </div>
  );
}

export default SettingsPage;
