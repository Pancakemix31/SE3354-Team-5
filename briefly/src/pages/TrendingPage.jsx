import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
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
const FALLBACK_DIGEST_FREQUENCY = '1d';

const TOPIC_BANNER_IMAGES = {
  world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c?auto=format&fit=crop&w=1400&q=80',
  politics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1400&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=80',
  finance: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1400&q=80',
  business: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80',
  health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80',
  culture: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1400&q=80',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80',
  environment: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=80',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80',
  cybersecurity: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80',
  climate: 'https://images.unsplash.com/photo-1569163139394-de44cb5894cf?auto=format&fit=crop&w=1400&q=80',
};

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

function buildTopicImage(topic) {
  const normalized = slugify(topic);
  if (TOPIC_BANNER_IMAGES[normalized]) return TOPIC_BANNER_IMAGES[normalized];
  const partial = Object.keys(TOPIC_BANNER_IMAGES).find((key) => normalized.includes(key));
  return partial ? TOPIC_BANNER_IMAGES[partial] : TOPIC_BANNER_IMAGES.world;
}

function mergeBriefings(existing, incoming, options = {}) {
  const { keepOnlyIncomingIds = false } = options;
  const incomingIds = new Set((incoming || []).map((a) => a?.id).filter(Boolean));
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
  const values = Array.from(map.values());
  const filtered = keepOnlyIncomingIds
    ? values.filter((item) => incomingIds.has(item?.id))
    : values;
  return filtered.sort((x, y) => (x.createdAt || 0) - (y.createdAt || 0));
}

function digestFrequencyToMs(value) {
  const normalized = String(value || FALLBACK_DIGEST_FREQUENCY).toLowerCase();
  switch (normalized) {
    case '30m':
      return 30 * 60 * 1000;
    case '1h':
    case 'hourly':
      return 60 * 60 * 1000;
    case '6h':
      return 6 * 60 * 60 * 1000;
    case '12h':
      return 12 * 60 * 60 * 1000;
    case '1d':
    case 'daily':
      return 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

function mapGeneratedArticles(apiData) {
  if (!apiData || !Array.isArray(apiData.preference_summaries)) return [];
  return apiData.preference_summaries.flatMap((prefSummary) => {
    const preference = prefSummary?.preference || 'general';
    const region = prefSummary?.region || apiData?.region || 'Global';
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
    const image = buildTopicImage(preference);

    return [{
      id,
      title: combinedTitle,
      source: `${cleanItems.length} summarized sources`,
      excerpt: excerpt || 'A generated multi-story briefing is available.',
      body: combinedBody,
      aiSummary: cleanItems
        .slice(0, 3)
        .map((item) => item?.summary || '')
        .filter(Boolean)
        .join(' '),
      url: firstUrl,
      image,
      category: capitalize(preference),
      region,
      momentum: 'Generated',
      createdAt: Date.now(),
    }];
  });
}

function extractNewsApiErrorMessage(apiData) {
  const summaries = Array.isArray(apiData?.preference_summaries) ? apiData.preference_summaries : [];
  const errors = summaries
    .map((entry) => String(entry?.summary?.error || '').toLowerCase())
    .filter(Boolean);
  if (errors.length === 0) return '';

  if (errors.every((msg) => msg.includes('ratelimited') || msg.includes('too many requests'))) {
    return 'NewsAPI daily limit reached. Generated briefings will return after quota resets.';
  }
  if (errors.some((msg) => msg.includes('api key') && msg.includes('invalid'))) {
    return 'NewsAPI key appears invalid. Update backend NewsAPI_KEY to continue loading briefings.';
  }
  return '';
}

export default function TrendingPage() {
  const { user } = useAuth();
  const { saveArticle, isSaved } = useSavedArticles();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [ratings, setRatings] = useState({});
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setRatings(loadRatings(user?.email));
  }, [user?.email]);

  useEffect(() => {
    let cancelled = false;
    let activeController = null;
    let refreshTimer = null;
    let inFlight = false;

    async function loadArticles({ background = false } = {}) {
      if (inFlight) return;
      inFlight = true;
      if (!background) setLoadingArticles(true);
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
        if (activeController) {
          activeController.abort();
        }
        activeController = new AbortController();
        const preferredTopics = Array.isArray(user?.newsCategories) && user.newsCategories.length > 0
          ? user.newsCategories.map((t) => String(t).toLowerCase())
          : ['technology', 'world'];
        const preferredRegion = typeof user?.newsRegion === 'string' && user.newsRegion.trim()
          ? user.newsRegion
          : 'Global';
        const summaryDepth = user?.summaryDepth === 'deep' ? 'deep' : 'concise';

        const response = await fetch(`${API_BASE_URL}/api/v1/news-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences: preferredTopics,
            region: preferredRegion,
            summary_depth: summaryDepth,
          }),
          signal: activeController.signal,
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = await response.json();
        const apiErrorMessage = extractNewsApiErrorMessage(payload);
        const generated = mapGeneratedArticles(payload);
        const merged = mergeBriefings(persisted, generated, { keepOnlyIncomingIds: true });

        if (cancelled) return;
        setArticles(merged);
        saveGeneratedArticles(merged);

        if (user?.uid && merged.length > 0) {
          await saveGeneratedNewsArticles(user.uid, merged);
        }
        setLastUpdatedAt(Date.now());

        if (apiErrorMessage) {
          setLoadError(apiErrorMessage);
        } else if (generated.length === 0 && merged.length === 0) {
          setLoadError('No generated articles were returned.');
        }
      } catch (error) {
        if (error.name !== 'AbortError' && !cancelled) {
          console.error('Failed to load generated news articles:', error);
          setLoadError('Unable to load new articles. Showing saved briefings if any.');
        }
      } finally {
        inFlight = false;
        if (!cancelled && !background) setLoadingArticles(false);
      }
    }

    loadArticles();
    const intervalMs = digestFrequencyToMs(user?.digestFrequency);
    refreshTimer = window.setInterval(() => {
      loadArticles({ background: true });
    }, intervalMs);

    return () => {
      cancelled = true;
      if (activeController) activeController.abort();
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, [user?.uid, user?.newsCategories, user?.newsRegion, user?.summaryDepth, user?.digestFrequency]);

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

  function onSaveArticle(article) {
    const result = saveArticle(article);
    if (result.needAuth) {
      navigate('/login', {
        state: {
          from: { pathname: '/news' },
          message: 'Sign in to save news articles.',
        },
      });
      return;
    }
    if (result.duplicate) {
      showToast('This article is already in your saved list.');
      return;
    }
    if (result.queued) {
      showToast('You appear to be offline. Save is queued for when you reconnect.');
      return;
    }
    if (result.ok) {
      showToast('Article saved.');
      return;
    }
    if (result.error) {
      showToast(result.error);
    }
  }

  function openAiSummary(article) {
    navigate('/summary', { state: { article } });
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
      {lastUpdatedAt ? (
        <p className="feature-toast" role="status">
          Last refreshed: {new Date(lastUpdatedAt).toLocaleTimeString()}
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
              <div className="news-card__media-wrap">
                <img
                  src={a.image || buildTopicImage(a.category)}
                  alt={`${a.category || 'News'} topic`}
                  className="news-card__media"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = buildTopicImage(a.category);
                  }}
                />
              </div>
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
              <div className="news-card__actions">
                <button
                  type="button"
                  className="news-card__summary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAiSummary(a);
                  }}
                >
                  AI summary
                </button>
                <button
                  type="button"
                  className="news-card__save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveArticle(a);
                  }}
                  disabled={isSaved(a.id)}
                  aria-pressed={isSaved(a.id)}
                >
                  {isSaved(a.id) ? 'Saved' : 'Save article'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
