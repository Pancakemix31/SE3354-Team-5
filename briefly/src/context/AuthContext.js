import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  PASSWORD_LENGTH_ERROR,
  PASSWORD_WHITESPACE_ERROR,
  passwordContainsWhitespace,
} from '../utils/passwordPolicy';

/**
 * Firebase auth provider for register/login/logout.
 * Uses Firebase Auth for credentials and Firestore for profile/preferences.
 */
const AuthContext = createContext(null);

function mapFirebaseError(code) {
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    // Security masking: avoid leaking which part was incorrect.
    return 'Invalid credentials.';
  }
  if (code === 'auth/weak-password') {
    return 'Please choose a stronger password.';
  }
  if (code === 'permission-denied') {
    return 'Missing Firestore permissions. Deploy firestore.rules or update rules in Firebase Console.';
  }
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({ topics: [], regions: [] });
  const [authReady, setAuthReady] = useState(false);

  // Restore Firebase session on first load.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setPreferences({ topics: [], regions: [] });
        setAuthReady(true);
        return;
      }

      let profile = {};
      try {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        profile = profileSnap.exists() ? profileSnap.data() : {};
      } catch {
        // e.g. permission-denied until Firestore rules allow users/{uid}
        profile = {};
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        name: profile.name ?? firebaseUser.displayName ?? '',
        emailVerified: firebaseUser.emailVerified,
      });
      setPreferences({
        topics: profile.topics ?? [],
        regions: profile.regions ?? [],
      });
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const register = useCallback(async (name, email, password) => {
    if (passwordContainsWhitespace(password)) {
      return { ok: false, error: PASSWORD_WHITESPACE_ERROR };
    }
    if (password.length < 8) {
      return { ok: false, error: PASSWORD_LENGTH_ERROR };
    }
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const firebaseUser = credential.user;
      const trimmedName = name.trim();
      await updateProfile(firebaseUser, { displayName: trimmedName });
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: trimmedName,
        email: firebaseUser.email ?? email.trim().toLowerCase(),
        topics: [],
        regions: [],
        createdAt: serverTimestamp(),
      });
      await sendEmailVerification(firebaseUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapFirebaseError(error?.code) };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    if (passwordContainsWhitespace(password)) {
      return { ok: false, error: PASSWORD_WHITESPACE_ERROR };
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapFirebaseError(error?.code) };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      authReady,
      user,
      preferences,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [authReady, user, preferences, login, register, logout]
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
