import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findGeneratedNewsArticleById } from '../lib/generatedNewsFirestore';
import { findGeneratedArticleById } from '../lib/newsArticlesStorage';
import '../styles/featurePages.css';

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

  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>{article.title}</h1>
        <p>{article.source} · {article.category}</p>
      </header>

      <article className="news-card">
        <p className="news-card__excerpt" style={{ whiteSpace: 'pre-wrap' }}>
          {article.body || article.excerpt}
        </p>
        {article.url ? (
          <p style={{ marginTop: '1rem' }}>
            <a href={article.url} target="_blank" rel="noreferrer">
              Read original source
            </a>
          </p>
        ) : null}
      </article>

      <p style={{ marginTop: '1rem' }}>
        <Link to="/news">Back to News</Link>
      </p>
    </div>
  );
}
