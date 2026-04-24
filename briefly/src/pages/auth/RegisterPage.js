import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import AuthLayout from './AuthLayout';

/**
 * Registration — wires to Firebase Auth.
 */
function RegisterPage() {
  const { register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (value) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Za-z]/.test(value)) {
      return 'Password must include at least one letter.';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must include at least one number.';
    }
    if (!/[!@#$%^&*(),.?"':{}|<>\[\]\\/~`_+=;-]/.test(value)) {
      return 'Password must include at least one special character.';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.ok) {
        navigate('/news', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.ok) {
        navigate('/news', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Unable to sign in with Google. Please try again.');
      console.error('Google registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account unlocks AI summaries, global trending, and preference-aware digests."
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
            placeholder="Jordan Lee"
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
            placeholder="you@example.com"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reg-password">Password</label>
          <div className="auth-password-input">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5c5.2 0 9.4 3.8 10.8 6.4a1.2 1.2 0 010 1.2C21.4 15.2 17.2 19 12 19S2.6 15.2 1.2 12.6a1.2 1.2 0 010-1.2C2.6 8.8 6.8 5 12 5zm0 2C8.1 7 4.8 9.7 3.5 12c1.3 2.3 4.6 5 8.5 5s7.2-2.7 8.5-5c-1.3-2.3-4.6-5-8.5-5zm0 2.3A2.7 2.7 0 1112 14.7a2.7 2.7 0 010-5.4z" />
              </svg>
            </button>
          </div>
          <p className="auth-help">Use at least 8 characters with letters, numbers, and a symbol.</p>
        </div>
        <div className="auth-field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <div className="auth-password-input">
            <input
              id="reg-confirm"
              name="confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showConfirmPassword}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5c5.2 0 9.4 3.8 10.8 6.4a1.2 1.2 0 010 1.2C21.4 15.2 17.2 19 12 19S2.6 15.2 1.2 12.6a1.2 1.2 0 010-1.2C2.6 8.8 6.8 5 12 5zm0 2C8.1 7 4.8 9.7 3.5 12c1.3 2.3 4.6 5 8.5 5s7.2-2.7 8.5-5c-1.3-2.3-4.6-5-8.5-5zm0 2.3A2.7 2.7 0 1112 14.7a2.7 2.7 0 010-5.4z" />
              </svg>
            </button>
          </div>
        </div>
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="auth-divider" aria-hidden="true">
          <span>or</span>
        </p>
        <button
          type="button"
          className="auth-google"
          disabled={loading}
          onClick={onGoogleSignIn}
        >
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
