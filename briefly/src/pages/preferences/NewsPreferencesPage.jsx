import React, { useState } from 'react';
import PageShell from '../../components/PageShell';

const DEFAULT_CATEGORIES = ['Finance', 'World', 'Politics', 'Technology'];

/** Categories, regions, and custom interests — validate at least one category. */
export default function NewsPreferencesPage() {
  const [selected, setSelected] = useState(() => new Set(['Technology', 'World']));
  const [region, setRegion] = useState('North America');

  function toggle(cat) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <PageShell
      title="News preferences"
      description="Choose categories and regions; preferences sync across devices via Firestore."
    >
      <section className="pref-section">
        <h2 className="pref-section__title">Categories</h2>
        <div className="chip-row">
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip${selected.has(cat) ? ' chip--on' : ''}`}
              onClick={() => toggle(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>
      <section className="pref-section">
        <h2 className="pref-section__title">Region</h2>
        <select className="stack-form__input" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option>North America</option>
          <option>Europe</option>
          <option>Middle East</option>
          <option>Asia Pacific</option>
          <option>Global</option>
        </select>
      </section>
      <button type="button" className="btn-primary" disabled={selected.size === 0}>
        Save preferences
      </button>
    </PageShell>
  );
}
