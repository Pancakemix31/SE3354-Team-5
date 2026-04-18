const keyFor = (email) => `briefly_article_ratings:${(email || '').toLowerCase()}`;

export function loadRatings(email) {
  if (!email) return {};
  try {
    const raw = localStorage.getItem(keyFor(email));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveRating(email, articleId, stars) {
  if (!email || !articleId) return;
  const all = loadRatings(email);
  all[articleId] = { stars, at: Date.now() };
  try {
    localStorage.setItem(keyFor(email), JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
