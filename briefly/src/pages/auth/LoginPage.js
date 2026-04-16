import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_WHITESPACE_ERROR, passwordContainsWhitespace } from '../../utils/passwordPolicy';
import AuthLayout from './AuthLayout';

/**
 * Sign-in form — wires to AuthContext (local mock). Swap for real API later.
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (passwordContainsWhitespace(password)) {
      setError(PASSWORD_WHITESPACE_ERROR);
      return;
    }
    const result = await login(email, password);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your account"
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
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
            placeholder="johndoe@example.com"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-wrap">
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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c-5.25 0-9.27 3.73-10.8 6.95a1.2 1.2 0 0 0 0 1.1C2.73 16.27 6.75 20 12 20s9.27-3.73 10.8-6.95a1.2 1.2 0 0 0 0-1.1C21.27 8.73 17.25 5 12 5Zm0 12c-3.96 0-7.18-2.75-8.53-5 1.35-2.25 4.57-5 8.53-5s7.18 2.75 8.53 5c-1.35 2.25-4.57 5-8.53 5Z" />
                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 4.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z" />
              </svg>
            </button>
          </div>
          <div className="auth-row auth-row--end">
            <button type="button" className="auth-forgot-link">
              Forgot password?
            </button>
          </div>
        </div>
        <button type="submit" className="auth-submit">
          Sign In
        </button>
      </form>
      <p className="auth-switch">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
