import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

/** Replace with Firebase Auth + Firestore profile sync when backend is ready. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => ({
    email: 'dev@briefly.app',
    displayName: 'Briefly Dev',
  }));

  const login = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser,
    }),
    [user, login, logout]
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
