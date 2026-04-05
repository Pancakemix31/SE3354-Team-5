const SAVED_KEY = 'briefly_saved_articles_v1';
const PENDING_KEY = 'briefly_saved_pending_v1';
const SYNC_KEY = 'briefly_saved_articles_sync_v1';

export const FORCE_INSERT_ERROR_KEY = 'briefly_force_insert_error';
export const READING_LIST_SYNC_EVENT = 'briefly-reading-list-sync';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

function readAllSaved() {
  const data = readJson(SAVED_KEY, {});
  return data && typeof data === 'object' ? data : {};
}

function emitSync(email) {
  const detail = { email, at: Date.now() };
  writeJson(SYNC_KEY, detail);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(READING_LIST_SYNC_EVENT, { detail }));
  }
}

function buildSavedEntry(article) {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    source: article.source || 'Unknown source',
    content: Array.isArray(article.content) ? article.content : [],
    readTime: article.readTime || '',
    url: article.url || '',
    ...(article.category ? { category: article.category } : {}),
    savedAt: new Date().toISOString(),
  };
}

export function getSavedArticles(email) {
  if (!email) return [];
  const all = readAllSaved();
  const list = all[email];
  return Array.isArray(list) ? list : [];
}

export function insertReadingListRecord(email, article) {
  if (!email || !article?.id) return { ok: false, duplicate: false };
  if (readJson(FORCE_INSERT_ERROR_KEY, false)) {
    return { ok: false, error: 'Unable to save this article right now.' };
  }
  const all = readAllSaved();
  const list = Array.isArray(all[email]) ? [...all[email]] : [];
  if (list.some((a) => a.id === article.id)) {
    return { ok: false, duplicate: true };
  }
  list.unshift(buildSavedEntry(article));
  all[email] = list;
  writeJson(SAVED_KEY, all);
  emitSync(email);
  return { ok: true };
}

export function syncReadingList(email) {
  if (!email) return;
  emitSync(email);
}

export function saveArticleForUser(email, article) {
  return insertReadingListRecord(email, article);
}

export function removeSavedArticle(email, articleId) {
  if (!email || !articleId) return;
  const all = readAllSaved();
  const list = Array.isArray(all[email]) ? all[email] : [];
  all[email] = list.filter((a) => a.id !== articleId);
  if (all[email].length === 0) delete all[email];
  writeJson(SAVED_KEY, all);
  emitSync(email);
}

export function clearSavedArticlesForUser(email) {
  if (!email) return;
  const all = readAllSaved();
  delete all[email];
  writeJson(SAVED_KEY, all);
  emitSync(email);
}

export function getPendingQueue() {
  const q = readJson(PENDING_KEY, []);
  return Array.isArray(q) ? q : [];
}

/** @returns {boolean} true if a new entry was queued */
export function enqueuePendingSave(email, article) {
  if (!email || !article?.id) return false;
  const q = getPendingQueue();
  const already = q.some((item) => item.email === email && item.article?.id === article.id);
  if (already) return false;
  q.push({ email, article, ts: Date.now() });
  writeJson(PENDING_KEY, q);
  return true;
}

export function clearPendingForEmail(email) {
  if (!email) return;
  const q = getPendingQueue().filter((item) => item.email !== email);
  writeJson(PENDING_KEY, q);
}

/** Apply queued saves for one user (e.g. after reconnect). Idempotent for duplicates. */
export function processPendingQueue(email) {
  if (!email) return;
  const q = getPendingQueue();
  const mine = [];
  const rest = [];
  for (const item of q) {
    if (item.email === email) mine.push(item);
    else rest.push(item);
  }
  for (const item of mine) {
    insertReadingListRecord(item.email, item.article);
  }
  writeJson(PENDING_KEY, rest);
  if (mine.length > 0) {
    emitSync(email);
  }
}

export function countPendingForEmail(email) {
  if (!email) return 0;
  return getPendingQueue().filter((item) => item.email === email).length;
}
