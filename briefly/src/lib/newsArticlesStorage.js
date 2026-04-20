const STORAGE_KEY = 'briefly_generated_news_articles';

export function saveGeneratedArticles(articles) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(articles) ? articles : []));
  } catch {
    /* ignore */
  }
}

export function loadGeneratedArticles() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findGeneratedArticleById(articleId) {
  const articles = loadGeneratedArticles();
  return articles.find((article) => article.id === articleId) || null;
}
