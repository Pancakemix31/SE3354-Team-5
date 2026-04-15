import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';

jest.mock('../firebase', () => ({
  auth: { name: 'mock-auth' },
  db: { name: 'mock-db' },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'doc-ref'),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-ts'),
  setDoc: jest.fn(),
}));

function Harness() {
  const { register, login, logout } = useAuth();
  const [result, setResult] = React.useState('');

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const res = await register('John Doe', 'john@example.com', 'StrongPass123!');
          setResult(res.ok ? 'register-ok' : res.error);
        }}
      >
        register
      </button>
      <button
        type="button"
        onClick={async () => {
          const res = await login('john@example.com', 'StrongPass123!');
          setResult(res.ok ? 'login-ok' : res.error);
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={async () => {
          await logout();
          setResult('logout-ok');
        }}
      >
        logout
      </button>
      <p>{result}</p>
    </div>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <Harness />
    </AuthProvider>
  );
}

describe('AuthContext use cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  test('TC-01 Valid Account Registration', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'uid-123', email: 'john@example.com' },
    });
    setDoc.mockResolvedValue(undefined);
    sendEmailVerification.mockResolvedValue(undefined);

    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => expect(screen.getByText('register-ok')).toBeInTheDocument());
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalled();
    expect(sendEmailVerification).toHaveBeenCalled();
  });

  test('TC-02 Duplicate Email Registration', async () => {
    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' });

    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() =>
      expect(screen.getByText(/already exists/i)).toBeInTheDocument()
    );
  });

  test('TC-03 Valid Account Login', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'uid-123' } });

    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText('login-ok')).toBeInTheDocument());
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  test('TC-04 Invalid Login Credentials', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });

    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    );
  });

  test('TC-05 Account Logout', async () => {
    signOut.mockResolvedValue(undefined);

    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => expect(screen.getByText('logout-ok')).toBeInTheDocument());
    expect(signOut).toHaveBeenCalled();
  });
});
