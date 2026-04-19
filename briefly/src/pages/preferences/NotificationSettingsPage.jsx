import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageShell from '../../components/PageShell';
import { loadNotificationPreferences, saveNotificationPreferences } from '../../lib/notificationPreferencesStorage';

/** Frequency, pause, breaking news — persist to Firestore; sync push provider. */
export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [frequency, setFrequency] = useState('1d');
  const [paused, setPaused] = useState(false);
  const [breaking, setBreaking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Load preferences on mount or when user changes
  useEffect(() => {
    const loadPrefs = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      const prefs = await loadNotificationPreferences(user.uid);
      setFrequency(prefs.notificationFrequency);
      setPaused(prefs.notificationsPaused);
      setBreaking(prefs.breakingAlerts);
      setLoading(false);
    };

    loadPrefs();
  }, [user, isAuthenticated]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const success = await saveNotificationPreferences(user.uid, {
      notificationFrequency: frequency,
      notificationsPaused: paused,
      breakingAlerts: breaking,
    });

    setSaving(false);
    if (success) {
      setToast('Notification settings saved.');
      setTimeout(() => setToast(''), 3000);
    } else {
      setToast('Failed to save settings. Please try again.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageShell
        title="Notifications"
        description="Sign in to customize notification settings."
      >
        <p>Please sign in to manage your notification preferences.</p>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Notifications" description="Loading your settings...">
        <p>Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Notifications"
      description="Control how often you get updates, pause temporarily, and toggle breaking alerts."
    >
      <form className="stack-form" onSubmit={handleSave}>
        <label className="stack-form__label">
          Update frequency
          <select
            className="stack-form__input"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="30m">Every 30 minutes</option>
            <option value="1h">Every 1 hour</option>
            <option value="6h">Every 6 hours</option>
            <option value="12h">Every 12 hours</option>
            <option value="1d">Every 1 day</option>
          </select>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)} />
          Pause all notifications
        </label>
        <label className="toggle">
          <input type="checkbox" checked={breaking} onChange={(e) => setBreaking(e.target.checked)} />
          Breaking news alerts
        </label>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save notification settings'}
        </button>
        {toast && <p className="stack-form__toast" role="status">{toast}</p>}
      </form>
    </PageShell>
  );
}
