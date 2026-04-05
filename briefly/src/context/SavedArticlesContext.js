import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  countPendingForEmail,
  enqueuePendingSave,
  getSavedArticles,
  processPendingQueue,
  removeSavedArticle,
  saveArticleForUser,
} from '../lib/savedArticlesStorage';

const SavedArticlesContext = createContext(null);

export function SavedArticlesProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [savedArticles, setSavedArticles] = useState([]);
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [version, setVersion] = useState(0);

  const email = user?.email ?? null;

  const reload = useCallback(() => {
    if (!email) {
      setSavedArticles([]);
      return;
    }
    setSavedArticles(getSavedArticles(email));
  }, [email]);

  useEffect(() => {
    reload();
  }, [reload, version]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      if (email) {
        processPendingQueue(email);
        setVersion((v) => v + 1);
      }
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [email]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  /**
   * @returns {{ ok: true } | { duplicate: true } | { needAuth: true } | { queued: true } | { error: string }}
   */
  const saveArticle = useCallback(
    (article) => {
      if (!isAuthenticated || !email) {
        return { needAuth: true };
      }
      if (!article?.id) {
        return { error: 'Invalid article.' };
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const added = enqueuePendingSave(email, article);
        if (!added) {
          return { duplicate: true };
        }
        bump();
        return { queued: true };
      }
      const result = saveArticleForUser(email, article);
      if (result.duplicate) {
        return { duplicate: true };
      }
      if (result.ok) {
        bump();
        return { ok: true };
      }
      return { error: 'Could not save article.' };
    },
    [isAuthenticated, email, bump]
  );

  const removeArticle = useCallback(
    (articleId) => {
      if (!email) return;
      removeSavedArticle(email, articleId);
      bump();
    },
    [email, bump]
  );

  const isSaved = useCallback(
    (articleId) => savedArticles.some((a) => a.id === articleId),
    [savedArticles]
  );

  const pendingCount = email ? countPendingForEmail(email) : 0;

  const value = useMemo(
    () => ({
      savedArticles,
      saveArticle,
      removeArticle,
      isSaved,
      isOnline: online,
      pendingCount,
      reload: bump,
    }),
    [savedArticles, saveArticle, removeArticle, isSaved, online, pendingCount, bump]
  );

  return (
    <SavedArticlesContext.Provider value={value}>{children}</SavedArticlesContext.Provider>
  );
}

export function useSavedArticles() {
  const ctx = useContext(SavedArticlesContext);
  if (!ctx) {
    throw new Error('useSavedArticles must be used within SavedArticlesProvider');
  }
  return ctx;
}
