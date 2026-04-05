import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';

/** Permanent account deletion — confirm + re-auth in production. */
export default function DeleteAccountPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const ready = confirmText.toLowerCase() === 'delete';

  function handleDelete(e) {
    e.preventDefault();
    if (!ready) return;
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <PageShell
      title="Delete account"
      description="This removes your Briefly profile and preferences. Wire to Firebase + Firestore cleanup."
    >
      <p className="page-warning">Type <strong>delete</strong> to confirm.</p>
      <form className="stack-form" onSubmit={handleDelete}>
        <label className="stack-form__label">
          Confirmation
          <input
            className="stack-form__input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            autoComplete="off"
          />
        </label>
        <button type="submit" className="btn-danger" disabled={!ready}>
          Delete my account
        </button>
      </form>
    </PageShell>
  );
}
