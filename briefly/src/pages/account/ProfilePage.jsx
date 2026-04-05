import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';

/** Profile edit — sync display name & email with Firestore. */
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.displayName || '');

  function handleSave(e) {
    e.preventDefault();
    setUser((prev) => (prev ? { ...prev, displayName: name } : prev));
  }

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
    </PageShell>
  );
}
