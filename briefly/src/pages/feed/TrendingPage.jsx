import React from 'react';
import PageShell from '../../components/PageShell';

/** Trending global news — rank by engagement; track views for analytics. */
export default function TrendingPage() {
  return (
    <PageShell
      title="Trending"
      description="Globally trending stories from aggregated sources (headline, source, region)."
    >
      <p>Placeholder list. Connect to trending endpoint and sort by engagement.</p>
    </PageShell>
  );
}
