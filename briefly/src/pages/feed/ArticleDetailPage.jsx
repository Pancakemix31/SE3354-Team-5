import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';

/** Article detail: AI summary, read time, source, Read more, rate relevance, save. */
export default function ArticleDetailPage() {
  const { articleId } = useParams();

  return (
    <PageShell
      title={`Article ${articleId || ''}`}
      description="Preview + full AI summary, outlet name, estimated reading time, credibility & bias signals, rating, and save."
    >
      <p>
        Dynamic route placeholder. Integrate summarization (under 2s target), then{' '}
        <a href="https://example.com" target="_blank" rel="noreferrer">
          Read more
        </a>{' '}
        to the original publisher.
      </p>
      <p>
        <Link to="/save">Save flow</Link> · <Link to="/">Back home</Link>
      </p>
    </PageShell>
  );
}
