import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DeleteAccountPage.css';

function DeleteAccountPage() {
  const { isAuthenticated, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: '/account/delete' } }}
      />
    );
  }

  const openModal = () => {
    setError('');
    setPassword('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPassword('');
    setError('');
  };

  const onConfirmDelete = async (e) => {
    e.preventDefault();
    setError('');
    const result = await deleteAccount(password);
    if (result.ok) {
      setModalOpen(false);
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="delete-account-page">
      <header className="delete-account-page__intro">
        <h1>Delete account</h1>
        <p>
          Permanently remove your Briefly account and saved data on this device. This cannot be
          undone.
        </p>
      </header>

      <section className="delete-account-page__panel" aria-labelledby="danger-heading">
        <h2 id="danger-heading">Danger zone</h2>
        <p className="delete-account-page__warn">
          Deleting your account removes your profile from this app and clears your saved articles
          and pending offline saves tied to your account.
        </p>
        <button type="button" className="delete-account-page__open" onClick={openModal}>
          Delete account…
        </button>
      </section>

      {modalOpen ? (
        <div
          className="delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="delete-modal__backdrop" onClick={closeModal} aria-hidden="true" />
          <div className="delete-modal__panel">
            <h2 id="delete-modal-title">Confirm account deletion</h2>
            <p className="delete-modal__text">
              This will permanently delete your account. You will be signed out immediately. To
              confirm, enter your password.
            </p>
            <form onSubmit={onConfirmDelete}>
              {error ? (
                <p className="delete-modal__error" role="alert">
                  {error}
                </p>
              ) : null}
              <label className="delete-modal__label" htmlFor="delete-password">
                Password
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                className="delete-modal__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="delete-modal__reset-hint">
                Forgot your password?{' '}
                <Link to="/reset-password" onClick={closeModal}>Reset it instead</Link>
              </p>
              <div className="delete-modal__actions">
                <button type="button" className="delete-modal__btn delete-modal__btn--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="delete-modal__btn delete-modal__btn--danger">
                  Confirm delete
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DeleteAccountPage;
