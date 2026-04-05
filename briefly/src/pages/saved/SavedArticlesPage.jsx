import React from 'react';
import PageShell from '../../components/PageShell';

/** Saved reading list — headline, source, saved date; remove & sync. */
export default function SavedArticlesPage() {
  return (
    <PageShell
      title="Saved articles"
      description="Articles you bookmarked for later. Backed by per-user storage in Firestore."
    >
      <p>No saved articles yet. Use Save from an article card or the Save article page.</p>
    </PageShell>
  );
}
