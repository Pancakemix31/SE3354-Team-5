import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import AuthLayout from './AuthLayout';

/**
 * Sign-in form — wires to Firebase Auth.
 */
function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;
  const infoMessage = location.state?.message || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.ok) {
        const to =
          fromPath && fromPath !== '/' && fromPath !== '/login' && fromPath !== '/register'
            ? fromPath
            : '/news';
        navigate(to, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
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
        const to =
          fromPath && fromPath !== '/' && fromPath !== '/login' && fromPath !== '/register'
            ? fromPath
            : '/news';
        navigate(to, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Unable to sign in with Google. Please try again.');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to sync briefings, topic preferences, and ratings on this device."
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {infoMessage ? (
          <p className="auth-info" role="status">
            {infoMessage}
          </p>
        ) : null}
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
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
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-input">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
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
        <Link to="/reset-password">Forgot password?</Link>
        {' · '}
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
