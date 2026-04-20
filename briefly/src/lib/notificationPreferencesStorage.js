import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULTS = {
  notificationFrequency: '1d',
  notificationsPaused: false,
  breakingAlerts: true,
};

/**
 * Load notification preferences from Firestore for authenticated user.
 * Falls back to localStorage if Firestore is unavailable.
 */
export async function loadNotificationPreferences(uid) {
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
      notificationFrequency: data.notificationFrequency || DEFAULTS.notificationFrequency,
      notificationsPaused: data.notificationsPaused ?? DEFAULTS.notificationsPaused,
      breakingAlerts: data.breakingAlerts ?? DEFAULTS.breakingAlerts,
    };
  } catch (error) {
    console.error('Error loading notification preferences:', error);
    return { ...DEFAULTS };
  }
}

/**
 * Save notification preferences to Firestore.
 */
export async function saveNotificationPreferences(uid, prefs) {
  if (!uid) {
    console.warn('Cannot save notification preferences: no user UID');
    return false;
  }

  try {
    await updateDoc(doc(db, 'users', uid), {
      notificationFrequency: prefs.notificationFrequency || DEFAULTS.notificationFrequency,
      notificationsPaused: prefs.notificationsPaused ?? DEFAULTS.notificationsPaused,
      breakingAlerts: prefs.breakingAlerts ?? DEFAULTS.breakingAlerts,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
}
