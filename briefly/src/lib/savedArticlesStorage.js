const SAVED_KEY = 'briefly_saved_articles_v1';
const PENDING_KEY = 'briefly_saved_pending_v1';

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

/**
 * @returns {Record<string, Array<{id: string, title: string, excerpt: string, category?: string, savedAt: string}>>}
 */
function readAllSaved() {
  const data = readJson(SAVED_KEY, {});
  return data && typeof data === 'object' ? data : {};
}

export function getSavedArticles(email) {
  if (!email) return [];
  const all = readAllSaved();
  const list = all[email];
  return Array.isArray(list) ? list : [];
}

/**
 * @returns {{ ok: true } | { ok: false, duplicate: true }}
 */
export function saveArticleForUser(email, article) {
  if (!email || !article?.id) return { ok: false, duplicate: false };
  const all = readAllSaved();
  const list = Array.isArray(all[email]) ? [...all[email]] : [];
  if (list.some((a) => a.id === article.id)) {
    return { ok: false, duplicate: true };
  }
  const entry = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    ...(article.category ? { category: article.category } : {}),
    savedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  all[email] = list;
  writeJson(SAVED_KEY, all);
  return { ok: true };
}

export function removeSavedArticle(email, articleId) {
  if (!email || !articleId) return;
  const all = readAllSaved();
  const list = Array.isArray(all[email]) ? all[email] : [];
  all[email] = list.filter((a) => a.id !== articleId);
  if (all[email].length === 0) delete all[email];
  writeJson(SAVED_KEY, all);
}

export function clearSavedArticlesForUser(email) {
  if (!email) return;
  const all = readAllSaved();
  delete all[email];
  writeJson(SAVED_KEY, all);
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
    saveArticleForUser(item.email, item.article);
  }
  writeJson(PENDING_KEY, rest);
}

export function countPendingForEmail(email) {
  if (!email) return 0;
  return getPendingQueue().filter((item) => item.email === email).length;
}
