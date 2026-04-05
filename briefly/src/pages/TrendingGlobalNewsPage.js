import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrending } from '../lib/trendingNews';
import './TrendingGlobalNewsPage.css';

// This page is used to adding trending global news section.
// Created by Saharsh
function TrendingGlobalNewsPage() {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchTrending()
      .then((result) => {
        if (cancelled) return;
        setStories(result.stories);
        setErrorMessage(result.degraded ? result.message : '');
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setStories([]);
        setErrorMessage('Trending stories are unavailable right now. Please try again shortly.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="trending-page">
      <header className="trending-page__intro">
        <h1>Trending global news</h1>
        <p>Top stories ranked by engagement, with source and region visible at a glance.</p>
      </header>

      {loading ? (
        <div className="trending-page__state" role="status">
          Loading trending stories...
        </div>
      ) : null}

      {!loading && errorMessage ? (
        <div className="trending-page__banner" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {!loading && stories.length > 0 ? (
        <ol className="trending-page__list" aria-label="Trending stories">
          {stories.map((story, index) => (
            <li key={story.id} className="trending-card">
              <Link className="trending-card__link" to={`/trending/${story.id}`}>
                <div className="trending-card__rank">#{index + 1}</div>
                <div className="trending-card__body">
                  <p className="trending-card__meta">
                    {story.source} | {story.region}
                  </p>
                  <h2>{story.title}</h2>
                  <p className="trending-card__summary">{story.summary}</p>
                  <p className="trending-card__engagement">
                    Most read and shared score: {story.engagementScore.toLocaleString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      ) : null}

      {!loading && stories.length === 0 ? (
        <div className="trending-page__state" role="status">
          No trending stories are available right now.
        </div>
      ) : null}
    </div>
  );
}

export default TrendingGlobalNewsPage;
