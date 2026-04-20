import React, { useState, useRef, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // adjust path to your firebase init file
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';
import '../SettingsPage.css';

/** Profile edit — sync display name & email with Firestore, plus notification settings. */
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const hideTimer = useRef(null);

  // Load notification preference from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    getDoc(userRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // Default to false if field is absent
          setNotificationsEnabled(data.notificationsEnabled ?? false);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingNotif(false));
  }, [user?.uid]);

  const showToast = useCallback((message) => {
    window.clearTimeout(hideTimer.current);
    setToast(message);
    setToastVisible(true);
    hideTimer.current = window.setTimeout(() => setToastVisible(false), 2800);
  }, []);

  function handleSave(e) {
    e.preventDefault();
    setUser((prev) => (prev ? { ...prev, displayName: name } : prev));
  }

  const handleNotificationToggle = async (e) => {
    const next = e.target.checked;
    setNotificationsEnabled(next);

    try {
      const userRef = doc(db, 'users', user.uid);
      // merge: true so we don't wipe other fields on the document
      await setDoc(userRef, { notificationsEnabled: next }, { merge: true });
      showToast(next ? 'Notifications enabled.' : 'Notifications disabled.');
    } catch (err) {
      console.error('Failed to save notification preference:', err);
      // Roll back optimistic update
      setNotificationsEnabled(!next);
      showToast('Failed to save. Please try again.');
    }
  };

  return (
    <PageShell title="Profile" description="Edit how you appear across devices.">
      <form className="stack-form" onSubmit={handleSave}>
        <label className="stack-form__label">
          Display name
          <input
            className="stack-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="stack-form__label">
          Email
          <input className="stack-form__input" value={user?.email || ''} readOnly />
        </label>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>

      <div className="settings-panel" style={{ marginTop: '2rem' }}>
        <h2>Notifications</h2>
        <p className="settings-panel__desc">
          Control whether you receive notification emails.
        </p>

        <div className="setting-row">
          <div>
            <span className="setting-row__label" id="notif-toggle-label">
              Email notifications
            </span>
            <p className="setting-row__help">
              When enabled, news update notifications will be sent to your email.
            </p>
          </div>
          <div className="toggle">
            <span className="toggle__state" aria-live="polite">
              {loadingNotif ? '…' : notificationsEnabled ? 'ON' : 'OFF'}
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                disabled={loadingNotif}
                aria-labelledby="notif-toggle-label"
              />
              <span className="switch__slider" />
            </label>
          </div>
        </div>

        <div
          className={`settings-toast${toastVisible ? ' settings-toast--visible' : ''}`}
          role="status"
        >
          {toast}
        </div>
      </div>
    </PageShell>
  );
}