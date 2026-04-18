import React from 'react';
import { TRENDING_ARTICLES } from '../data/trendingNews';
import '../styles/featurePages.css';

export default function TrendingPage() {
  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <h1>Trending globally</h1>
        <p>
          Live-ranked stories from aggregated sources. Connect your API to replace this curated
          preview with real-time momentum scores.
        </p>
      </header>
      <div className="news-grid">
        {TRENDING_ARTICLES.map((a) => (
          <article key={a.id} className="news-card">
            <div className="news-card__meta">
              <span className="news-card__badge">{a.momentum}</span>
              <span>{a.region}</span>
              <span>{a.category}</span>
            </div>
            <h2 className="news-card__title">{a.title}</h2>
            <p className="news-card__src">{a.source}</p>
            <p className="news-card__excerpt">{a.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
