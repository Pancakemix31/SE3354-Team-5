import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  PASSWORD_LENGTH_ERROR,
  PASSWORD_WHITESPACE_ERROR,
  passwordContainsWhitespace,
} from '../../utils/passwordPolicy';
import AuthLayout from './AuthLayout';

/**
 * Registration: Firebase Auth + Firestore user profile (name, email, prefs).
 */
function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (passwordContainsWhitespace(password) || passwordContainsWhitespace(confirm)) {
      setError(PASSWORD_WHITESPACE_ERROR);
      return;
    }
    if (password.length < 8) {
      setError(PASSWORD_LENGTH_ERROR);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const result = await register(name, email, password);
    if (result.ok) {
      navigate('/settings', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Briefly and get started today"
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="auth-field">
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="johndoe@example.com"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reg-password">Password</label>
          <div className="auth-password-wrap">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c-5.25 0-9.27 3.73-10.8 6.95a1.2 1.2 0 0 0 0 1.1C2.73 16.27 6.75 20 12 20s9.27-3.73 10.8-6.95a1.2 1.2 0 0 0 0-1.1C21.27 8.73 17.25 5 12 5Zm0 12c-3.96 0-7.18-2.75-8.53-5 1.35-2.25 4.57-5 8.53-5s7.18 2.75 8.53 5c-1.35 2.25-4.57 5-8.53 5Z" />
                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 4.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <div className="auth-password-wrap">
            <input
              id="reg-confirm"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c-5.25 0-9.27 3.73-10.8 6.95a1.2 1.2 0 0 0 0 1.1C2.73 16.27 6.75 20 12 20s9.27-3.73 10.8-6.95a1.2 1.2 0 0 0 0-1.1C21.27 8.73 17.25 5 12 5Zm0 12c-3.96 0-7.18-2.75-8.53-5 1.35-2.25 4.57-5 8.53-5s7.18 2.75 8.53 5c-1.35 2.25-4.57 5-8.53 5Z" />
                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 4.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z" />
              </svg>
            </button>
          </div>
        </div>
        <button type="submit" className="auth-submit">
          Create Account
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
