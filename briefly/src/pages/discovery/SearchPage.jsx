import React, { useState } from 'react';
import PageShell from '../../components/PageShell';

/** Keyword search — combine with date filter on feed or dedicated results. */
export default function SearchPage() {
  const [q, setQ] = useState('');

  return (
    <PageShell
      title="Search"
      description="Find articles by keyword; pair with date filters on the main feed when implemented."
    >
      <label className="stack-form__label">
        Keywords
        <input
          className="stack-form__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. climate summit"
        />
      </label>
      <p className="text-muted">Results placeholder for “{q || '…'}”.</p>
    </PageShell>
  );
}
