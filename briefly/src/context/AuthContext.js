import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore session on first load (if the user still exists locally).
  useEffect(() => {
    const email = readSessionEmail();
    if (!email) return;
    const users = readUsers();
    const found = users.find((u) => u.email === email);
    if (found) {
      setUser({ email: found.email, name: found.name });
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
    });
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalized }));
    setUser({ email: normalized, name: name.trim() });
    return { ok: true };
  }, []);

  const login = useCallback((email, password) => {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    const found = users.find((u) => u.email === normalized);
    if (!found || found.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: found.email }));
    setUser({ email: found.email, name: found.name });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
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
