import React, { useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';

const STORAGE_KEY = 'briefly-theme';

/** Light / dark mode — toggle class on document root for global theming. */
export default function AppearancePage() {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <PageShell title="Appearance" description="Switch between light and dark themes.">
      <div className="chip-row">
        <button
          type="button"
          className={`chip${mode === 'light' ? ' chip--on' : ''}`}
          onClick={() => setMode('light')}
        >
          Light
        </button>
        <button
          type="button"
          className={`chip${mode === 'dark' ? ' chip--on' : ''}`}
          onClick={() => setMode('dark')}
        >
          Dark
        </button>
      </div>
    </PageShell>
  );
}
