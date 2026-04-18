import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clearPendingForEmail, clearSavedArticlesForUser } from '../lib/savedArticlesStorage';

/**
 * Mock authentication — persists users + session in localStorage.
 * Replace `login` / `register` with API calls when the backend is ready.
 */
const AuthContext = createContext(null);

const USERS_KEY = 'briefly_users';
const SESSION_KEY = 'briefly_session';

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSessionEmail() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.email ?? null;
  } catch {
    return null;
  }
}

function stripPassword(record) {
  if (!record) return null;
  const { password: _p, ...rest } = record;
  return rest;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore session on first load (if the user still exists locally).
  useEffect(() => {
    const email = readSessionEmail();
    if (!email) return;
    const users = readUsers();
    const found = users.find((u) => u.email === email);
    if (found) {
      setUser(stripPassword(found));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const register = useCallback((name, email, password) => {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    users.push({
      name: name.trim(),
      email: normalized,
      password,
      digestFrequency: 'daily',
      summaryDepth: 'concise',
    });
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalized }));
    setUser(
      stripPassword({
        name: name.trim(),
        email: normalized,
        password,
        digestFrequency: 'daily',
        summaryDepth: 'concise',
      })
    );
    return { ok: true };
  }, []);

  const login = useCallback((email, password) => {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    const found = users.find((u) => u.email === normalized);
    if (!found) {
      return { ok: false, error: 'No account found with this email.' };
    }
    if (found.password !== password) {
      return { ok: false, error: 'Invalid password.' };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: found.email }));
    setUser(stripPassword(found));
    return { ok: true };
  }, []);

  const updateProfile = useCallback(
    (fields) => {
      if (!user) {
        return { ok: false, error: 'You must be signed in.' };
      }
      const users = readUsers();
      const i = users.findIndex((u) => u.email === user.email);
      if (i === -1) {
        return { ok: false, error: 'Account not found.' };
      }
      const next = { ...users[i] };
      if (typeof fields.name === 'string' && fields.name.trim()) {
        next.name = fields.name.trim();
      }
      if (fields.digestFrequency === 'hourly' || fields.digestFrequency === 'daily') {
        next.digestFrequency = fields.digestFrequency;
      }
      if (fields.summaryDepth === 'concise' || fields.summaryDepth === 'deep') {
        next.summaryDepth = fields.summaryDepth;
      }
      users[i] = next;
      writeUsers(users);
      setUser(stripPassword(next));
      return { ok: true };
    },
    [user]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const deleteAccount = useCallback((password) => {
    if (!user) {
      return { ok: false, error: 'You must be signed in to delete your account.' };
    }
    const users = readUsers();
    const found = users.find((u) => u.email === user.email);
    if (!found || found.password !== password) {
      return { ok: false, error: 'Invalid password. Account deletion cancelled.' };
    }
    const next = users.filter((u) => u.email !== user.email);
    writeUsers(next);
    clearSavedArticlesForUser(user.email);
    clearPendingForEmail(user.email);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    return { ok: true };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      deleteAccount,
      updateProfile,
    }),
    [user, login, register, logout, deleteAccount, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
