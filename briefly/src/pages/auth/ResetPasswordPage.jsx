import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/** Password reset via email — integrate Firebase sendPasswordResetEmail. */
export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <h1 className="auth-page__title">Reset password</h1>
      {sent ? (
        <p className="auth-page__message">Check your email for a reset link (placeholder).</p>
      ) : (
        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__label">
            Email
            <input className="auth-page__input" type="email" required />
          </label>
          <button type="submit" className="auth-page__submit">
            Send link
          </button>
        </form>
      )}
      <p className="auth-page__footer">
        <Link to="/login">Back to log in</Link>
      </p>
    </>
  );
}
