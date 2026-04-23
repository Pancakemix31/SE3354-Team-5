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
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
