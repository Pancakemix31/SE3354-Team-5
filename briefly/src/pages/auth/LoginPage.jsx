import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Login — swap form for Firebase Auth when wired. */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    login({ email: email || 'user@briefly.app', displayName: email?.split('@')[0] || 'User' });
    navigate(from, { replace: true });
  }

  return (
    <>
      <h1 className="auth-page__title">Log in</h1>
      <form className="auth-page__form" onSubmit={handleSubmit}>
        <label className="auth-page__label">
          Email
          <input
            className="auth-page__input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="auth-page__label">
          Password
          <input
            className="auth-page__input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="auth-page__submit">
          Log in
        </button>
      </form>
      <p className="auth-page__footer">
        <Link to="/reset-password">Forgot password?</Link>
        {' · '}
        <Link to="/register">Create account</Link>
      </p>
    </>
  );
}
