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
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  deleteUser,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { clearPendingForEmail, clearSavedArticlesForUser } from '../lib/savedArticlesStorage';

const googleProvider = new GoogleAuthProvider();

/**
 * Firebase authentication — persists users + session in Firebase Auth and Firestore.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserFromFirebase = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const nextUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || userData.name || '',
      digestFrequency: userData.digestFrequency || 'daily',
      summaryDepth: userData.summaryDepth || 'concise',
    };

    setUser(nextUser);
    return nextUser;
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUserFromFirebase(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [syncUserFromFirebase]);

  const register = useCallback(async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateFirebaseProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        digestFrequency: 'daily',
        summaryDepth: 'concise',
        createdAt: new Date(),
      });

      await syncUserFromFirebase(firebaseUser);
      return { ok: true };
    } catch (error) {
      let errorMessage = 'An error occurred during registration.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          console.error('Registration error:', error);
      }
      return { ok: false, error: errorMessage };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserFromFirebase(credential.user);
      return { ok: true };
    } catch (error) {
      let errorMessage = 'An unexpected error occurred during sign in.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Username or password is incorrect.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        default:
          console.error('Login error:', error);
      }
      return { ok: false, error: errorMessage };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            digestFrequency: 'daily',
            summaryDepth: 'concise',
            createdAt: new Date(),
          });
        }

        await syncUserFromFirebase(firebaseUser);
      }

      return { ok: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { ok: false, error: 'Unable to sign in with Google. Please try again.' };
    }
  }, []);

  const updateProfile = useCallback(async (fields) => {
    if (!user) {
      return { ok: false, error: 'You must be signed in.' };
    }

    try {
      const updates = {};

      if (typeof fields.name === 'string' && fields.name.trim()) {
        updates.name = fields.name.trim();
        // Update Firebase Auth display name
        await updateFirebaseProfile(auth.currentUser, { displayName: fields.name.trim() });
      }

      if (fields.digestFrequency === 'hourly' || fields.digestFrequency === 'daily') {
        updates.digestFrequency = fields.digestFrequency;
      }

      if (fields.summaryDepth === 'concise' || fields.summaryDepth === 'deep') {
        updates.summaryDepth = fields.summaryDepth;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', user.uid), updates);
        
        // Update local state
        setUser(prev => ({ ...prev, ...updates }));
      }

      return { ok: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { ok: false, error: 'Failed to update profile.' };
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const deleteAccount = useCallback(async (password) => {
    if (!user) {
      return { ok: false, error: 'You must be signed in to delete your account.' };
    }

    try {
      // Re-authenticate user before deletion
      await signInWithEmailAndPassword(auth, user.email, password);
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Clear local storage
      clearSavedArticlesForUser(user.email);
      clearPendingForEmail(user.email);
      
      // Delete Firebase user
      await deleteUser(auth.currentUser);
      
      return { ok: true };
    } catch (error) {
      let errorMessage = 'Failed to delete account.';
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Invalid password. Account deletion cancelled.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please sign in again before deleting your account.';
          break;
        default:
          console.error('Delete account error:', error);
      }
      return { ok: false, error: errorMessage };
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      signInWithGoogle,
      logout,
      deleteAccount,
      updateProfile,
    }),
    [user, loading, login, register, signInWithGoogle, logout, deleteAccount, updateProfile]
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
