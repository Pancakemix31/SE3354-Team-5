import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArticleById } from '../data/articles';
import './ArticlePage.css';

const FETCH_DELAY_MS = 350;

function ArticlePage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      setArticle(getArticleById(articleId));
      setLoading(false);
    }, FETCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [articleId]);

  if (loading) {
    return (
      <div className="article-page">
        <p className="article-page__loading">Fetching full article content...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page">
        <h1>Article not found</h1>
        <p>The requested article is no longer available in this demo library.</p>
        <Link className="article-page__link" to="/saved">
          Back to reading list
        </Link>
      </div>
    );
  }

  return (
    <article className="article-page">
      <header className="article-page__header">
        <p className="article-page__eyebrow">
          {article.source} | {article.category} | {article.readTime}
        </p>
        <h1>{article.title}</h1>
        <p className="article-page__excerpt">{article.excerpt}</p>
      </header>

      <div className="article-page__content">
        {article.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="article-page__actions">
        <Link className="article-page__link" to="/saved">
          Back to reading list
        </Link>
        <a className="article-page__link article-page__link--secondary" href={article.url}>
          Original publisher
        </a>
      </div>
    </article>
  );
}

export default ArticlePage;
