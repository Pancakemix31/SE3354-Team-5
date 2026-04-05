import React, { useState } from 'react';
import PageShell from '../../components/PageShell';

/**
 * Save-article use case (demo).
 * In production, this action lives on article cards; this page is for isolated QA / Ridwan’s flow.
 */
export default function SaveArticlePage() {
  const [saved, setSaved] = useState(false);

  return (
    <PageShell
      title="Save article"
      description="Demonstrates idempotent save (no duplicates) with user feedback."
    >
      <div className="demo-card">
        <h2 className="demo-card__title">Sample headline</h2>
        <p className="demo-card__meta">Reuters · 2 min read</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setSaved(true)}
          disabled={saved}
        >
          {saved ? 'Saved' : 'Save article'}
        </button>
      </div>
    </PageShell>
  );
}
