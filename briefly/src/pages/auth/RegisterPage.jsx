import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Registration — align with Firestore profile creation in expanded use case. */
export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    login({ email: email || 'new@briefly.app', displayName: 'New user' });
    navigate('/profile', { replace: true });
  }

  return (
    <>
      <h1 className="auth-page__title">Create account</h1>
      <form className="auth-page__form" onSubmit={handleSubmit}>
        <label className="auth-page__label">
          Email
          <input
            className="auth-page__input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="auth-page__label">
          Password
          <input className="auth-page__input" type="password" required minLength={8} />
        </label>
        <button type="submit" className="auth-page__submit">
          Sign up
        </button>
      </form>
      <p className="auth-page__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </>
  );
}
