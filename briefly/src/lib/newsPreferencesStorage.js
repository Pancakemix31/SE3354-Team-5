const keyFor = (email) => `briefly_news_prefs:${(email || '').toLowerCase()}`;

const DEFAULTS = {
  categories: ['Technology', 'World'],
  region: 'Global',
};

export function loadNewsPreferences(email) {
  if (!email) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(keyFor(email));
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULTS.categories,
      region: typeof parsed.region === 'string' ? parsed.region : DEFAULTS.region,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveNewsPreferences(email, prefs) {
  if (!email) return;
  try {
    localStorage.setItem(
      keyFor(email),
      JSON.stringify({
        categories: prefs.categories,
        region: prefs.region,
      })
    );
  } catch {
    /* ignore */
  }
}
