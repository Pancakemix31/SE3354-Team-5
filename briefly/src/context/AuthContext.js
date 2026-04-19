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
  signOut,
  onAuthStateChanged,
  deleteUser,
  updateProfile as updateFirebaseProfile,
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

/**
 * Firebase authentication — persists users + session in Firebase Auth and Firestore.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || userData.name || '',
          digestFrequency: userData.digestFrequency || 'daily',
          summaryDepth: userData.summaryDepth || 'concise',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (error) {
      let errorMessage = 'An error occurred during sign in.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password.';
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
      logout,
      deleteAccount,
      updateProfile,
    }),
    [user, loading, login, register, logout, deleteAccount, updateProfile]
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
