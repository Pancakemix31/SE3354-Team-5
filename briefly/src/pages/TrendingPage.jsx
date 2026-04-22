import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadRatings, saveRating } from '../lib/articleRatingsStorage';
import {
  loadGeneratedArticles,
  saveGeneratedArticles,
} from '../lib/newsArticlesStorage';
import {
  loadGeneratedNewsArticles,
  saveGeneratedNewsArticles,
} from '../lib/generatedNewsFirestore';
import '../styles/featurePages.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function capitalize(value) {
  const text = String(value || '').trim();
  if (!text) return 'General';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mergeBriefings(existing, incoming) {
  const map = new Map();
  (existing || []).forEach((a) => {
    if (a?.id) map.set(a.id, { ...a });
  });
  (incoming || []).forEach((a) => {
    if (!a?.id) return;
    const prev = map.get(a.id);
    map.set(a.id, {
      ...a,
      createdAt: prev?.createdAt ?? a.createdAt ?? Date.now(),
    });
  });
  return Array.from(map.values()).sort((x, y) => (x.createdAt || 0) - (y.createdAt || 0));
}

function mapGeneratedArticles(apiData) {
  if (!apiData || !Array.isArray(apiData.preference_summaries)) return [];
  return apiData.preference_summaries.flatMap((prefSummary) => {
    const preference = prefSummary?.preference || 'general';
    let summaryItems = prefSummary?.summary?.article_summaries;
    if (!Array.isArray(summaryItems) || summaryItems.length === 0) {
      const raw = prefSummary?.summary?.raw_summary;
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.article_summaries)) {
            summaryItems = parsed.article_summaries;
          }
        } catch {
          /* ignore parse fallback */
        }
      }
    }
    if (!Array.isArray(summaryItems) || summaryItems.length === 0) {
      summaryItems = Array.isArray(prefSummary?.articles)
        ? prefSummary.articles.map((article) => ({
            title: article?.title || '',
            source: article?.source?.name || article?.source || 'Unknown source',
            summary: article?.description || article?.content || 'No summary is available for this article yet.',
            url: article?.url || '',
          }))
        : [];
    }
    if (!Array.isArray(summaryItems) || summaryItems.length === 0) return [];

    const cleanItems = summaryItems.filter((item) => item?.title || item?.summary);
    if (cleanItems.length === 0) return [];

    const combinedTitle = `${capitalize(preference)} Briefing`;
    const id = `gen-brief-${slugify(preference)}`;
    const excerpt = cleanItems
      .slice(0, 2)
      .map((item) => item?.summary || '')
      .filter(Boolean)
      .join(' ');
    const combinedBody = cleanItems
      .map((item, index) => {
        const entryTitle = item?.title || `Update ${index + 1}`;
        const entrySource = item?.source || 'Unknown source';
        const entrySummary = item?.summary || 'No summary is available for this update.';
        return `${index + 1}. ${entryTitle} (${entrySource})\n${entrySummary}`;
      })
      .join('\n\n');
    const firstUrl = cleanItems.find((item) => item?.url)?.url || '';

    return [{
      id,
      title: combinedTitle,
      source: `${cleanItems.length} summarized sources`,
      excerpt: excerpt || 'A generated multi-story briefing is available.',
      body: combinedBody,
      url: firstUrl,
      category: capitalize(preference),
      region: 'Global',
      momentum: 'Generated',
      createdAt: Date.now(),
    }];
  });
}

export default function TrendingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [ratings, setRatings] = useState({});
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadError, setLoadError] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => {
    setRatings(loadRatings(user?.email));
  }, [user?.email]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadArticles() {
      setLoadingArticles(true);
      setLoadError('');

      let persisted = [];
      if (user?.uid) {
        persisted = await loadGeneratedNewsArticles(user.uid);
      } else {
        persisted = loadGeneratedArticles();
      }
      if (cancelled) return;
      if (persisted.length > 0) {
        setArticles(persisted);
        saveGeneratedArticles(persisted);
      }

      try {
        const preferredTopics = Array.isArray(user?.newsCategories) && user.newsCategories.length > 0
          ? user.newsCategories.map((t) => String(t).toLowerCase())
          : ['technology', 'world'];

        const response = await fetch(`${API_BASE_URL}/api/v1/news-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferences: preferredTopics }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = await response.json();
        const generated = mapGeneratedArticles(payload);
        const merged = mergeBriefings(persisted, generated);

        if (cancelled) return;
        setArticles(merged);
        saveGeneratedArticles(merged);

        if (user?.uid && merged.length > 0) {
          await saveGeneratedNewsArticles(user.uid, merged);
        }

        if (generated.length === 0 && merged.length === 0) {
          setLoadError('No generated articles were returned.');
        }
      } catch (error) {
        if (error.name !== 'AbortError' && !cancelled) {
          console.error('Failed to load generated news articles:', error);
          setLoadError('Unable to load new articles. Showing saved briefings if any.');
        }
      } finally {
        if (!cancelled) setLoadingArticles(false);
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user?.uid, user?.newsCategories]);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2200);
  }

  function setStars(articleId, stars) {
    if (!user?.email) return;
    saveRating(user.email, articleId, stars);
    setRatings(loadRatings(user.email));
    showToast('Rating saved for this article.');
  }

  function openArticle(article) {
    navigate(`/news/${article.id}`, { state: { article } });
  }

  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>News</h1>
        <p>
          Browse global trending stories and rate each update to tune what you see more of.
        </p>
      </header>
      {toast ? (
        <p className="feature-toast" role="status">
          {toast}
        </p>
      ) : null}
      {loadingArticles ? (
        <p className="feature-toast" role="status">
          Generating personalized articles...
        </p>
      ) : null}
      {loadError ? (
        <p className="feature-toast" role="status">
          {loadError}
        </p>
      ) : null}
      {!loadingArticles && !loadError && articles.length === 0 ? (
        <p className="feature-toast" role="status">
          No generated briefings available yet.
        </p>
      ) : null}
      <div className="news-grid">
        {articles.map((a) => {
          const current = ratings[a.id]?.stars ?? 0;
          return (
            <article
              key={a.id}
              className="news-card news-card--clickable"
              role="button"
              tabIndex={0}
              onClick={() => openArticle(a)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openArticle(a);
                }
              }}
            >
              <div className="news-card__meta">
                <span className="news-card__badge">{a.momentum}</span>
                <span>{a.region}</span>
                <span>{a.category}</span>
              </div>
              <h2 className="news-card__title">{a.title}</h2>
              <p className="news-card__src">{a.source}</p>
              <p className="news-card__excerpt">{a.excerpt}</p>
              <div className="rate-row">
                <span className="rate-row__label">Your rating</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`rate-star${n <= current ? ' rate-star--on' : ''}`}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setStars(a.id, n);
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
