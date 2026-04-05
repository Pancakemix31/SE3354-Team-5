/**
 * Firestore shape (draft) — align with Flask + Firebase in the SE doc.
 * Backend owners: map these to security rules and indexes.
 */
export const COLLECTIONS = {
  users: 'users',
  /** Subcollections or embedded maps — adjust to your schema. */
  preferences: 'preferences',
  savedArticles: 'savedArticles',
  readingHistory: 'readingHistory',
  ratings: 'ratings',
  feedback: 'feedback',
};

/** Example document fields for `users/{uid}` — for typing / validation later. */
export const USER_DOC_FIELDS = {
  email: 'string',
  displayName: 'string',
  newsCategories: 'string[]',
  regions: 'string[]',
  notificationFrequency: "'hourly' | 'daily' | 'weekly'",
  notificationsPaused: 'boolean',
  breakingAlerts: 'boolean',
  theme: "'light' | 'dark'",
  updatedAt: 'timestamp',
};
