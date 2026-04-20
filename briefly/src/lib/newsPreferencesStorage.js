import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULTS = {
  categories: ['Technology', 'World'],
  region: 'Global',
};

export async function loadNewsPreferences(uid) {
  if (!uid) {
    return { ...DEFAULTS };
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { ...DEFAULTS };
    }

    const data = userDoc.data();
    return {
      categories: Array.isArray(data.newsCategories) && data.newsCategories.length > 0
        ? data.newsCategories
        : DEFAULTS.categories,
      region: typeof data.newsRegion === 'string' ? data.newsRegion : DEFAULTS.region,
    };
  } catch (error) {
    console.error('Error loading news preferences:', error);
    return { ...DEFAULTS };
  }
}

export async function saveNewsPreferences(uid, prefs) {
  if (!uid) {
    return false;
  }

  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        newsCategories: prefs.categories,
        newsRegion: prefs.region,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving news preferences:', error);
    return false;
  }
}
