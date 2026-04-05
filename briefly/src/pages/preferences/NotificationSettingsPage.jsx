import React, { useState } from 'react';
import PageShell from '../../components/PageShell';

/** Frequency, pause, breaking news — persist to Firestore; sync push provider. */
export default function NotificationSettingsPage() {
  const [frequency, setFrequency] = useState('daily');
  const [paused, setPaused] = useState(false);
  const [breaking, setBreaking] = useState(true);

  return (
    <PageShell
      title="Notifications"
      description="Control how often you get updates, pause temporarily, and toggle breaking alerts."
    >
      <div className="stack-form">
        <label className="stack-form__label">
          Update frequency
          <select
            className="stack-form__input"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
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
        <button type="button" className="btn-primary">
          Save notification settings
        </button>
      </div>
    </PageShell>
  );
}
