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
        navigate('/trending', { replace: true });
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
        navigate('/trending', { replace: true });
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
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8+ characters"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
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
