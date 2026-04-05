import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTrendingStoryById } from '../lib/trendingNews';
import { trackStoryView } from '../lib/analytics';
import './TrendingGlobalNewsPage.css';

function TrendingStoryPage() {
  const { storyId } = useParams();
  const story = getTrendingStoryById(storyId);

  useEffect(() => {
    if (story) {
      trackStoryView(story);
    }
  }, [story]);

  if (!story) {
    return (
      <div className="trending-page">
        <div className="trending-page__state">
          <h1>Story not found</h1>
          <p>This trending story is no longer available.</p>
          <Link className="trending-page__cta" to="/trending">
            Back to trending
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="trending-story">
      <header className="trending-story__header">
        <p className="trending-story__meta">
          {story.source} | {story.region} |{' '}
          {new Date(story.publishedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
        <h1>{story.title}</h1>
        <p className="trending-story__summary">{story.summary}</p>
      </header>

      <div className="trending-story__content">
        {story.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="trending-story__footer">
        <Link className="trending-page__cta" to="/trending">
          Back to trending
        </Link>
        <span className="trending-story__analytics" role="status">
          trackStoryView() confirmed.
        </span>
      </div>
    </article>
  );
}

export default TrendingStoryPage;
