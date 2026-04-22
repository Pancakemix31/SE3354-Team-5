import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const FIELD = 'generatedNewsArticles';

/**
 * Load persisted generated news briefings from the user profile document.
 */
export async function loadGeneratedNewsArticles(uid) {
  if (!uid) return [];
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return [];
    const data = snap.data();
    const list = data[FIELD];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('loadGeneratedNewsArticles:', e);
    return [];
  }
}

/**
 * Replace stored briefings (caller should merge beforehand).
 */
export async function saveGeneratedNewsArticles(uid, articles) {
  if (!uid) return false;
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        [FIELD]: Array.isArray(articles) ? articles : [],
        generatedNewsArticlesUpdatedAt: new Date(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('saveGeneratedNewsArticles:', e);
    return false;
  }
}

/**
 * Find one briefing by id from Firestore (e.g. deep link / refresh on article page).
 */
export async function findGeneratedNewsArticleById(uid, articleId) {
  if (!uid || !articleId) return null;
  const list = await loadGeneratedNewsArticles(uid);
  return list.find((a) => a.id === articleId) || null;
}
