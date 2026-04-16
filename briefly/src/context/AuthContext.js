import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
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
  /** Bumped when register() applies profile state so stale onAuthStateChanged work is ignored. */
  const profileSyncGenerationRef = useRef(0);

  // Restore Firebase session on first load.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setPreferences({ topics: [], regions: [] });
        setAuthReady(true);
        return;
      }

      const genAtStart = profileSyncGenerationRef.current;

      let profile = {};
      try {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        profile = profileSnap.exists() ? profileSnap.data() : {};
      } catch {
        // e.g. permission-denied until Firestore rules allow users/{uid}
        profile = {};
      }

      // Registration can finish writing profile after this listener started; register() bumps
      // profileSyncGenerationRef and sets user — skip so we don't overwrite with stale reads.
      if (genAtStart !== profileSyncGenerationRef.current) {
        return;
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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) {
      return { ok: false, error: 'Please enter your full name.' };
    }
    if (!trimmedEmail) {
      return { ok: false, error: 'Please enter your email.' };
    }
    if (passwordContainsWhitespace(password)) {
      return { ok: false, error: PASSWORD_WHITESPACE_ERROR };
    }
    if (password.length < 8) {
      return { ok: false, error: PASSWORD_LENGTH_ERROR };
    }
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const firebaseUser = credential.user;
      await updateProfile(firebaseUser, { displayName: trimmedName });
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: trimmedName,
        email: firebaseUser.email ?? trimmedEmail,
        topics: [],
        regions: [],
        createdAt: serverTimestamp(),
      });
      await sendEmailVerification(firebaseUser);

      profileSyncGenerationRef.current += 1;
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        name: trimmedName,
        emailVerified: firebaseUser.emailVerified,
      });
      setPreferences({
        topics: [],
        regions: [],
      });
      setAuthReady(true);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapFirebaseError(error?.code) };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { ok: false, error: 'Please enter your email.' };
    }
    if (!password) {
      return { ok: false, error: 'Please enter your password.' };
    }
    if (passwordContainsWhitespace(password)) {
      return { ok: false, error: PASSWORD_WHITESPACE_ERROR };
    }
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const firebaseUser = credential.user;

      let profile = {};
      try {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        profile = profileSnap.exists() ? profileSnap.data() : {};
      } catch {
        profile = {};
      }

      // Apply state before returning so navigated pages see a user immediately.
      // onAuthStateChanged may still be behind; bump generation so stale listener work is dropped.
      profileSyncGenerationRef.current += 1;
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
