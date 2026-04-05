import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';

/** Personalized feed — wire to Flask + news APIs + user preferences. */
export default function HomePage() {
  return (
    <PageShell
      title="Your briefing"
      description="Headlines and preview summaries tailored to categories and regions you choose."
    >
      <p>
        This is the home feed placeholder. Teammates can replace this with cards that show headline,
        outlet, preview summary, reading time, credibility score, and links to{' '}
        <Link to="/article/demo">full detail</Link>.
      </p>
    </PageShell>
  );
}
