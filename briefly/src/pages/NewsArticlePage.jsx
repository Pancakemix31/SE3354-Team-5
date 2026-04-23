import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findGeneratedNewsArticleById } from '../lib/generatedNewsFirestore';
import { findGeneratedArticleById } from '../lib/newsArticlesStorage';
import '../styles/featurePages.css';

function parseBriefingEntries(text) {
  const input = String(text || '').trim();
  if (!input) return [];

  const chunks = input
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const entries = chunks.map((chunk) => {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const headline = lines[0];
    const match = headline.match(/^\s*(\d+)\.\s*(.+?)(?:\s+\(([^)]+)\))?\s*$/);
    if (!match) return null;

    const index = Number(match[1]);
    const title = (match[2] || '').trim();
    const source = (match[3] || '').trim();
    const summary = lines.slice(1).join(' ').trim();

    if (!title) return null;
    return {
      index,
      title,
      source,
      summary: summary || 'No summary details available for this item.',
    };
  }).filter(Boolean);

  return entries.length >= 2 ? entries : [];
}

export default function NewsArticlePage() {
  const { articleId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const fromState = location.state?.article;
  const [article, setArticle] = useState(fromState || null);
  const [loading, setLoading] = useState(!fromState);

  useEffect(() => {
    if (fromState) {
      setArticle(fromState);
      setLoading(false);
      return;
    }

    const cached = findGeneratedArticleById(articleId);
    if (cached) {
      setArticle(cached);
      setLoading(false);
      return;
    }

    if (!user?.uid || !articleId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    findGeneratedNewsArticleById(user.uid, articleId).then((a) => {
      if (cancelled) return;
      setArticle(a);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fromState, articleId, user?.uid]);

  if (loading) {
    return (
      <div className="feature-page">
        <header className="feature-page__header">
          <h1>Loading article…</h1>
        </header>
        <Link to="/news">Back to News</Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="feature-page">
        <header className="feature-page__header">
          <h1>Article not found</h1>
          <p>The selected article is unavailable. Return to News and open an article again.</p>
        </header>
        <Link className="home__btn home__btn--primary" to="/news">
          Back to News
        </Link>
      </div>
    );
  }

  const briefingItems = parseBriefingEntries(article.body || article.excerpt);
  const hasStructuredBriefing = briefingItems.length > 0;

  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>{article.title}</h1>
        <p>{article.source} · {article.category}</p>
      </header>

      <article className="news-card news-card--detail">
        {hasStructuredBriefing ? (
          <section className="briefing-list" aria-label="Generated briefing items">
            {briefingItems.map((item) => (
              <article key={`${item.index}-${item.title}`} className="briefing-item">
                <div className="briefing-item__head">
                  <span className="briefing-item__index">{item.index}</span>
                  <h2 className="briefing-item__title">{item.title}</h2>
                </div>
                {item.source ? <p className="briefing-item__source">{item.source}</p> : null}
                <p className="briefing-item__summary">{item.summary}</p>
              </article>
            ))}
          </section>
        ) : (
          <p className="news-card__excerpt news-card__excerpt--detail" style={{ whiteSpace: 'pre-wrap' }}>
            {article.body || article.excerpt}
          </p>
        )}
        {article.url ? (
          <p className="news-card__source-link-wrap">
            <a className="news-card__source-link" href={article.url} target="_blank" rel="noreferrer">
              Read original source
            </a>
          </p>
        ) : null}
      </article>

      <p className="news-detail__back-link">
        <Link to="/news">Back to News</Link>
      </p>
    </div>
  );
}
