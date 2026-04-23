/** AI Summary — article + generate summary flow (mock latency). */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useSavedArticles } from '../context/SavedArticlesContext';
import './SummaryPage.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

/** Simulated latency so loading state feels realistic (no network call). */
const SUMMARY_DELAY_MS = 900;

const FALLBACK_ARTICLE = {
  id: 'feat-data-centers-cooling-2025',
  title: 'Data centers trial smarter cooling to trim energy use',
  excerpt:
    'University researchers announced a new approach to reducing energy use in data centers by optimizing cooling systems with machine learning.',
  category: 'Technology',
  image: '',
  url: '',
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

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
};

function getTopicBannerImage(category) {
  const key = slugify(category);
  if (TOPIC_BANNER_IMAGES[key]) return TOPIC_BANNER_IMAGES[key];
  const partialKey = Object.keys(TOPIC_BANNER_IMAGES).find((k) => key.includes(k));
  if (partialKey) return TOPIC_BANNER_IMAGES[partialKey];
  return TOPIC_BANNER_IMAGES.world;
}

function getSourceHost(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function buildHeroForCategory(category) {
  return getTopicBannerImage(category);
}

/**
 * AI Summary flow: article + generate button + loading + animated summary card.
 */
function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromNewsArticle = location.state?.article || null;
  const { user, isAuthenticated } = useAuth();
  const { saveArticle, isSaved } = useSavedArticles();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [featuredArticle, setFeaturedArticle] = useState(FALLBACK_ARTICLE);
  const [dailyStory, setDailyStory] = useState(FALLBACK_ARTICLE);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `Hey ${user?.name || 'there'}, what can I brief for you today?`,
      citations: [],
    },
  ]);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const displayName = user?.name || 'there';
    setChatMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0]?.role === 'assistant' &&
        Array.isArray(prev[0]?.citations) &&
        prev[0].citations.length === 0
      ) {
        return [
          {
            ...prev[0],
            text: `Hey ${displayName}, what can I brief for you today?`,
          },
        ];
      }
      return prev;
    });
  }, [user?.name]);

  const showToast = useCallback((message) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    setToastVisible(true);
    toastTimer.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedStory() {
      if (fromNewsArticle) {
        const override = {
          id: fromNewsArticle.id || `feat-${Date.now()}`,
          title: fromNewsArticle.title || FALLBACK_ARTICLE.title,
          excerpt: fromNewsArticle.excerpt || fromNewsArticle.body || FALLBACK_ARTICLE.excerpt,
          category: fromNewsArticle.category || FALLBACK_ARTICLE.category,
          image: fromNewsArticle.image || '',
          url: fromNewsArticle.url || '',
          aiSummary: fromNewsArticle.aiSummary || fromNewsArticle.body || '',
        };
        setFeaturedArticle(override);
        setLoadingFeatured(false);
        return;
      }

      setLoadingFeatured(true);
      try {
        const preferredTopics = Array.isArray(user?.newsCategories) && user.newsCategories.length > 0
          ? user.newsCategories.map((t) => String(t).toLowerCase())
          : ['technology', 'world'];
        const preferredRegion = typeof user?.newsRegion === 'string' && user.newsRegion.trim()
          ? user.newsRegion
          : 'Global';

        const response = await fetch(`${API_BASE_URL}/api/v1/news-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: preferredTopics, region: preferredRegion }),
        });
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = await response.json();
        const storyByPreference = Array.isArray(payload?.preference_summaries)
          ? payload.preference_summaries.find((entry) => Array.isArray(entry?.articles) && entry.articles.length > 0)
          : null;
        const firstStory = storyByPreference?.articles?.[0];
        const summaryItems = Array.isArray(storyByPreference?.summary?.article_summaries)
          ? storyByPreference.summary.article_summaries
          : [];
        const pref = String(storyByPreference?.preference || preferredTopics[0] || 'technology');

        if (!firstStory?.title) {
          throw new Error('No suitable featured story returned.');
        }

        const stableIdSource = firstStory.url || firstStory.title;
        const stableId = `feat-${String(stableIdSource)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
          .slice(0, 100)}`;

        if (!cancelled) {
          const matchingSummary = summaryItems.find((item) => {
            const sameUrl = item?.url && firstStory?.url && item.url === firstStory.url;
            const sameTitle = item?.title && firstStory?.title && item.title === firstStory.title;
            return sameUrl || sameTitle;
          }) || summaryItems[0];

          const nextStory = {
            id: stableId || `feat-${Date.now()}`,
            title: firstStory.title,
            excerpt: firstStory.description || firstStory.content || 'No preview available.',
            category: pref.charAt(0).toUpperCase() + pref.slice(1),
            image: firstStory.urlToImage || '',
            url: firstStory.url || '',
            aiSummary: matchingSummary?.summary || '',
          };
          setDailyStory(nextStory);
          setFeaturedArticle(fromNewsArticle ? {
            id: fromNewsArticle.id || `feat-${Date.now()}`,
            title: fromNewsArticle.title || nextStory.title,
            excerpt: fromNewsArticle.excerpt || fromNewsArticle.body || nextStory.excerpt,
            category: fromNewsArticle.category || nextStory.category,
            image: fromNewsArticle.image || '',
            url: fromNewsArticle.url || '',
            aiSummary: fromNewsArticle.aiSummary || fromNewsArticle.body || '',
          } : nextStory);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load featured story:', error);
          const fallbackStory = { ...FALLBACK_ARTICLE, aiSummary: '' };
          setDailyStory(fallbackStory);
          setFeaturedArticle(fromNewsArticle ? {
            id: fromNewsArticle.id || fallbackStory.id,
            title: fromNewsArticle.title || fallbackStory.title,
            excerpt: fromNewsArticle.excerpt || fromNewsArticle.body || fallbackStory.excerpt,
            category: fromNewsArticle.category || fallbackStory.category,
            image: fromNewsArticle.image || '',
            url: fromNewsArticle.url || '',
            aiSummary: fromNewsArticle.aiSummary || fromNewsArticle.body || '',
          } : fallbackStory);
        }
      } finally {
        if (!cancelled) setLoadingFeatured(false);
      }
    }

    loadFeaturedStory();
    return () => {
      cancelled = true;
    };
  }, [fromNewsArticle, user?.newsCategories, user?.newsRegion]);

  const buildReadableSummary = useCallback((article) => {
    const rawSummary = String(article?.aiSummary || '').trim();
    const rawExcerpt = String(article?.excerpt || '').trim();
    const text = rawSummary || rawExcerpt;
    if (!text) return 'No summary available for this story.';

    const normalizedSummary = rawSummary.toLowerCase();
    const normalizedExcerpt = rawExcerpt.toLowerCase();
    const tooSimilar =
      normalizedSummary &&
      normalizedExcerpt &&
      (normalizedSummary === normalizedExcerpt ||
        normalizedSummary.includes(normalizedExcerpt.slice(0, 120)) ||
        normalizedExcerpt.includes(normalizedSummary.slice(0, 120)));

    if (!tooSimilar) {
      return text.length > 650 ? `${text.slice(0, 647)}...` : text;
    }

    const parts = rawExcerpt
      .replace(/\s+/g, ' ')
      .split(/[.!?]\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const lead = parts[0] || rawExcerpt;
    const follow = parts[1] || '';
    const category = article?.category || 'News';
    const title = article?.title || 'This story';
    return `${title}. In this ${category.toLowerCase()} update, ${lead.toLowerCase()}${follow ? ` ${follow}` : ''} The key takeaway is that this story may influence near-term developments in its topic area.`;
  }, []);

  const onSaveArticle = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/summary' },
          message: 'Sign in to save articles to your list.',
        },
      });
      return;
    }
    const result = saveArticle(featuredArticle);
    if (result.needAuth) {
      navigate('/login', {
        state: {
          from: { pathname: '/summary' },
          message: 'Sign in to save articles to your list.',
        },
      });
      return;
    }
    if (result.duplicate) {
      showToast('This article is already in your saved list.');
      return;
    }
    if (result.queued) {
      showToast('You appear to be offline. Save is queued and will finish when you are back online.');
      return;
    }
    if (result.ok) {
      showToast('Article saved to your list.');
      return;
    }
    if (result.error) {
      showToast(result.error);
    }
  }, [featuredArticle, isAuthenticated, navigate, saveArticle, showToast]);

  const runSummary = useCallback(() => {
    setLoading(true);
    setShowCard(false);
    setSummary('');

    window.setTimeout(async () => {
      try {
        const summaryDepth = user?.summaryDepth === 'deep' ? 'deep' : 'concise';
        const preferredRegion = typeof user?.newsRegion === 'string' && user.newsRegion.trim()
          ? user.newsRegion
          : 'Global';
        const preference = String(featuredArticle?.category || 'general').toLowerCase();

        const response = await fetch(`${API_BASE_URL}/api/v1/article-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            article: {
              title: featuredArticle?.title || '',
              description: featuredArticle?.excerpt || '',
              content: featuredArticle?.body || featuredArticle?.excerpt || '',
              url: featuredArticle?.url || '',
              source: featuredArticle?.source || '',
            },
            preference,
            region: preferredRegion,
            summary_depth: summaryDepth,
          }),
        });
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = await response.json();
        const baseSummary = String(payload?.response?.summary || '').trim();
        const points = Array.isArray(payload?.response?.key_points)
          ? payload.response.key_points.filter(Boolean)
          : [];
        const composed = points.length > 0
          ? `${baseSummary}\n\nKey points:\n${points.map((p) => `- ${p}`).join('\n')}`
          : baseSummary;
        const nextSummary = composed || buildReadableSummary(featuredArticle);
        const limit = summaryDepth === 'deep' ? 1200 : 700;
        const condensed = nextSummary.length > limit ? `${nextSummary.slice(0, limit - 3)}...` : nextSummary;
        setSummary(condensed);
      } catch (error) {
        console.error('Failed to generate article summary:', error);
        const nextSummary = buildReadableSummary(featuredArticle);
        const condensed = nextSummary.length > 700 ? `${nextSummary.slice(0, 697)}...` : nextSummary;
        setSummary(condensed);
      } finally {
        setLoading(false);
        setShowCard(true);
      }
    }, SUMMARY_DELAY_MS);
  }, [buildReadableSummary, featuredArticle, user?.newsRegion, user?.summaryDepth]);

  const sendChatMessage = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;

    const userMessage = { role: 'user', text: question, citations: [] };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const preferredTopics = Array.isArray(user?.newsCategories) && user.newsCategories.length > 0
        ? user.newsCategories.map((t) => String(t).toLowerCase())
        : ['technology', 'world'];
      const preferredRegion = typeof user?.newsRegion === 'string' && user.newsRegion.trim()
        ? user.newsRegion
        : 'Global';

      const response = await fetch(`${API_BASE_URL}/api/v1/news-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          preferences: preferredTopics,
          region: preferredRegion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const payload = await response.json();
      const answer = payload?.response?.answer || 'I could not generate an answer right now.';
      const keyPoints = Array.isArray(payload?.response?.key_points) ? payload.response.key_points : [];
      const citations = Array.isArray(payload?.response?.citations) ? payload.response.citations : [];
      const fullText = keyPoints.length > 0
        ? `${answer}\n\nKey points:\n${keyPoints.map((p) => `- ${p}`).join('\n')}`
        : answer;

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fullText,
          citations,
        },
      ]);
    } catch (error) {
      console.error('News chat failed:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I could not answer right now. Please try again in a moment.',
          citations: [],
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, user?.newsCategories, user?.newsRegion]);

  return (
    <div className="summary-page">
      <header className="summary-page__intro">
        <h1>Featured News</h1>
        <p>Pulled from your current News preferences and region settings.</p>
      </header>
      {fromNewsArticle && dailyStory?.id && dailyStory.id !== featuredArticle.id ? (
        <div className="summary-page__switch">
          <span>You opened a specific story.</span>
          <button
            type="button"
            className="summary-page__switch-btn"
            onClick={() => {
              setFeaturedArticle(dailyStory);
              setShowCard(false);
              setSummary('');
            }}
          >
            Use news of the day
          </button>
        </div>
      ) : null}
      {loadingFeatured ? <p className="summary-page__status">Loading a fresh story...</p> : null}

      <article className="article-card" aria-labelledby="article-title">
        <div className="article-card__hero">
          <img
            src={featuredArticle.image || buildHeroForCategory(featuredArticle.category)}
            alt={`${featuredArticle.category} featured story`}
            className="article-card__hero-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = buildHeroForCategory(featuredArticle.category);
            }}
          />
        </div>
        <div className="article-card__body">
          <p className="article-card__meta">{featuredArticle.category}</p>
          <h2 id="article-title" className="article-card__title">
            {featuredArticle.title}
          </h2>
          <div className="article-card__chips">
            <span className="article-card__chip">
              {dailyStory?.id && featuredArticle.id === dailyStory.id ? 'News of the day' : 'Selected story'}
            </span>
            <span className="article-card__chip">AI-powered summary</span>
            <span className="article-card__chip">{featuredArticle.category}</span>
          </div>
          <p className="article-card__text">
            {featuredArticle.excerpt}
          </p>
          {featuredArticle.url ? (
            <p className="article-card__source">
              Original source:{' '}
              <a href={featuredArticle.url} target="_blank" rel="noreferrer">
                {getSourceHost(featuredArticle.url) || 'Open source'}
              </a>
            </p>
          ) : null}
          <div className="summary-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onSaveArticle}
              disabled={isSaved(featuredArticle.id)}
              aria-pressed={isSaved(featuredArticle.id)}
            >
              {isSaved(featuredArticle.id) ? 'Saved' : 'Save article'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={runSummary}
              disabled={loading}
              aria-busy={loading}
            >
              {loading && <span className="btn-primary__spinner" aria-hidden="true" />}
              {loading ? 'Generating…' : 'Generate Summary'}
            </button>
            {featuredArticle.url ? (
              <a
                className="summary-open-link"
                href={featuredArticle.url}
                target="_blank"
                rel="noreferrer"
              >
                Open full article
              </a>
            ) : null}
            {loading && (
              <div className="summary-loading-mark" aria-hidden="true">
                <Logo height={36} className="logo-img--pulse" />
              </div>
            )}
          </div>
          <div
            className={`summary-toast${toastVisible ? ' summary-toast--visible' : ''}`}
            role="status"
            aria-live="polite"
          >
            {toast}
          </div>
        </div>
      </article>

      {showCard && (
        <section className="summary-result summary-result--visible" aria-live="polite">
          <div className="summary-result__label">
            <span>Summary</span>
            <span className="summary-result__tag">AI</span>
          </div>
          <p className="summary-result__text">{summary}</p>
        </section>
      )}

      <button
        type="button"
        className="news-chat-fab"
        onClick={() => setChatOpen((open) => !open)}
        aria-expanded={chatOpen}
        aria-label={chatOpen ? 'Close Briefly chat' : 'Open Briefly chat'}
      >
        <span className="news-chat-fab__image" aria-hidden="true">
          <Logo height={20} className="news-chat-fab__logo" />
        </span>
        <span className="news-chat-fab__label">{chatOpen ? 'Close Briefly' : 'Briefly'}</span>
      </button>

      {chatOpen ? (
        <section className="news-chat-popup" aria-live="polite">
          <div className="news-chat__head">
            <h3>Briefly</h3>
            <p>Ask me about recent news in your selected topics and region, and I will answer with evidence.</p>
          </div>
          <div className="news-chat__messages">
            {chatMessages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`news-chat__bubble news-chat__bubble--${msg.role}`}
              >
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                {msg.role === 'assistant' && Array.isArray(msg.citations) && msg.citations.length > 0 ? (
                  <div className="news-chat__citations">
                    <p>Sources</p>
                    <ul>
                      {msg.citations.slice(0, 4).map((c, i) => (
                        <li key={`${c.url || c.title || i}`}>
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noreferrer">
                              {(c.title || 'Untitled').trim()} ({c.source || 'Source'})
                            </a>
                          ) : (
                            <span>{(c.title || 'Untitled').trim()} ({c.source || 'Source'})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
            {chatLoading ? (
              <div className="news-chat__bubble news-chat__bubble--assistant">
                <p>Thinking...</p>
              </div>
            ) : null}
          </div>
          <div className="news-chat__composer">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder="Ask about recent relevant news..."
            />
            <button type="button" className="btn-primary" onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}>
              {chatLoading ? 'Sending...' : 'Ask'}
            </button>
          </div>
        </section>
      ) : null}

    </div>
  );
}

export default SummaryPage;
