import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="We'll send a reset link to your email address.">
      {sent ? (
        <p className="auth-info" role="status">
          Check your inbox — a reset link is on its way.
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="auth-field">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="auth-switch">
        <Link to="/login">Back to log in</Link>
      </p>
    </AuthLayout>
  );
}
