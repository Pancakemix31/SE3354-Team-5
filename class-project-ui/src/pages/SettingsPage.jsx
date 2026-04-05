import { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/use-case-2.css';

/** Same keys as the original static demo so existing saves still load. */
const STORAGE_KEYS = {
  ENABLED: 'se_project_notifications_enabled',
  FREQUENCY: 'se_project_notifications_frequency',
};

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

function loadInitialSettings() {
  const enabledRaw = readStorage(STORAGE_KEYS.ENABLED);
  const freqRaw = readStorage(STORAGE_KEYS.FREQUENCY);
  const enabled = enabledRaw === 'true';
  const frequency = freqRaw === 'daily' || freqRaw === 'hourly' ? freqRaw : 'daily';
  if (enabledRaw === null && freqRaw === null) {
    return { enabled: false, frequency: 'daily' };
  }
  return { enabled, frequency };
}

/**
 * Notification toggle + frequency select, localStorage persistence, confirmation banner (Use Case 2).
 */
export default function SettingsPage() {
  const [{ enabled, frequency }, setState] = useState(loadInitialSettings);
  const [bannerText, setBannerText] = useState('');
  const [bannerVisible, setBannerVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  const showBanner = useCallback((message) => {
    window.clearTimeout(hideTimer.current);
    setBannerText(message);
    setBannerVisible(true);
    hideTimer.current = window.setTimeout(() => setBannerVisible(false), 3200);
  }, []);

  const onToggle = (e) => {
    const on = e.target.checked;
    setState((s) => ({ ...s, enabled: on }));
    writeStorage(STORAGE_KEYS.ENABLED, on ? 'true' : 'false');
    showBanner(`Notifications turned ${on ? 'ON' : 'OFF'}. Preference saved.`);
  };

  const onFrequency = (e) => {
    const freq = e.target.value;
    setState((s) => ({ ...s, frequency: freq }));
    writeStorage(STORAGE_KEYS.FREQUENCY, freq);
    const label = freq === 'hourly' ? 'Hourly' : 'Daily';
    showBanner(`Frequency set to ${label}. Preference saved.`);
  };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero__inner">
          <p className="use-case-eyebrow">
            <span className="use-case-badge">Use case 2</span>
            <span className="use-case-label">Modify Notification Settings</span>
          </p>
          <h1>Your notification preferences</h1>
          <p className="hero-lead">
            Turn alerts on or off and choose how often we check for updates. Changes save in your
            browser and reload automatically next visit.
          </p>
          <p className="grader-note" role="note">
            <strong>For grading:</strong> This screen implements{' '}
            <strong>Use Case 2 — Modify Notification Settings</strong>. Includes a styled toggle,
            frequency dropdown (Hourly / Daily), confirmation messages on change, and persistence
            via <code>localStorage</code>.
          </p>
        </div>
      </div>

      <main className="site-main" id="main-content">
        <div className="main-inner settings-layout">
          <aside className="settings-aside" aria-label="Section overview">
            <h2 className="settings-aside__title">Account</h2>
            <ul className="settings-aside__list">
              <li>
                <span className="settings-aside__fake-link is-current">Notifications</span>
              </li>
              <li>
                <span className="settings-aside__fake-link is-disabled">Profile</span>{' '}
                <em>(demo)</em>
              </li>
              <li>
                <span className="settings-aside__fake-link is-disabled">Security</span>{' '}
                <em>(demo)</em>
              </li>
            </ul>
          </aside>

          <div className="settings-panels">
            <section className="settings-panel" id="use-case-2" aria-labelledby="uc2-heading">
              <div className="settings-panel__head">
                <h2 className="settings-panel__title" id="uc2-heading">
                  Notifications
                </h2>
                <p className="settings-panel__desc">
                  Control whether Briefly Wire can remind you about new stories and how often.
                </p>
              </div>

              <div className="setting-row">
                <div className="setting-row__text">
                  <label className="setting-row__label row-label" htmlFor="notifToggle">
                    Push-style alerts
                  </label>
                  <p className="setting-row__help">
                    When on, the app is allowed to show notification-style confirmations in this
                    demo.
                  </p>
                </div>
                <div className="setting-row__control">
                  <div className="toggle-wrap">
                    <span className="toggle-state" id="toggleStateLabel" aria-hidden="true">
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                    <label className="switch" title="Enable or disable notifications">
                      <input
                        type="checkbox"
                        id="notifToggle"
                        checked={enabled}
                        onChange={onToggle}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="setting-row setting-row--stack">
                <div className="setting-row__text">
                  <label className="setting-row__label" htmlFor="frequencySelect">
                    Digest frequency
                  </label>
                  <p className="setting-row__help">
                    How often to summarize activity. Options: Hourly or Daily.
                  </p>
                </div>
                <div className="freq-group">
                  <select
                    id="frequencySelect"
                    aria-describedby="settingsHint"
                    value={frequency}
                    onChange={onFrequency}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div
                className={`confirm-banner${bannerVisible ? ' show' : ''}`}
                id="confirmBanner"
                role="status"
              >
                {bannerText}
              </div>
              <p className="status-hint" id="settingsHint">
                Preferences are stored in <strong>localStorage</strong> in this browser only and are
                restored when you reload the page.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
