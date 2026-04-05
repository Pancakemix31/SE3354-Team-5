import { useEffect } from 'react';

const STORAGE_KEY = 'briefly-theme';

/** Applies saved theme before first paint of settings page. */
export default function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);
  return null;
}
