import React from 'react';
import PageShell from '../../components/PageShell';

/** User engagement insights — opens, saves, ratings trend. */
export default function EngagementDashboardPage() {
  return (
    <PageShell
      title="Engagement"
      description="Dashboard for how you interact with Briefly (charts wire to analytics backend)."
    >
      <ul className="simple-list">
        <li>Articles opened this week: —</li>
        <li>Saved articles: —</li>
        <li>Average relevance rating given: —</li>
      </ul>
    </PageShell>
  );
}
