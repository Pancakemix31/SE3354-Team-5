import React, { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_NEWS_PREFERENCES = 'briefly_news_preferences';
const DEFAULT_CATEGORIES = ['Finance', 'Political', 'Global'];

/**
 * Read string from localStorage; returns null if missing or unreadable.
 */
function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / quota — silently ignore */
  }
}

/**
 * Load initial news preferences from storage.
 */
function loadInitialNewsPreferences() {
  const value = readStorage(STORAGE_NEWS_PREFERENCES);
  if (!value) {
    return { selected: [], customOptions: [] };
  }

  try {
    const parsed = JSON.parse(value);
    return {
      selected: Array.isArray(parsed.selected) ? parsed.selected : [],
      customOptions: Array.isArray(parsed.customOptions) ? parsed.customOptions : [],
    };
  } catch {
    return { selected: [], customOptions: [] };
  }
}

/**
 * News preferences tab — select from predefined categories, add custom ones, display tags.
 */
function NewsPreferencesTab({ showToast }) {
  const [newsPreferences, setNewsPreferences] = useState(loadInitialNewsPreferences);
  const [customOption, setCustomOption] = useState('');

  const availableOptions = [...DEFAULT_CATEGORIES, ...newsPreferences.customOptions];

  const onTogglePreference = useCallback(
    (option) => {
      setNewsPreferences((prev) => {
        const currentlySelected = prev.selected.includes(option);
        const nextSelected = currentlySelected
          ? prev.selected.filter((item) => item !== option)
          : [...prev.selected, option];
        const next = { ...prev, selected: nextSelected };
        writeStorage(STORAGE_NEWS_PREFERENCES, JSON.stringify(next));
        showToast(
          currentlySelected
            ? `Removed ${option} from preferences.`
            : `Added ${option} to preferences.`
        );
        return next;
      });
    },
    [showToast]
  );

  const onAddCustomOption = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = customOption.trim();
      if (!trimmed) {
        return;
      }

      const normalized = trimmed.replace(/\s+/g, ' ');
      const alreadyExists = availableOptions.some(
        (option) => option.toLowerCase() === normalized.toLowerCase()
      );

      if (alreadyExists) {
        showToast('This preference already exists.');
        setCustomOption('');
        return;
      }

      const next = {
        customOptions: [...newsPreferences.customOptions, normalized],
        selected: [...newsPreferences.selected, normalized],
      };

      setNewsPreferences(next);
      writeStorage(STORAGE_NEWS_PREFERENCES, JSON.stringify(next));
      setCustomOption('');
      showToast(`Added "${normalized}" preference.`);
    },
    [customOption, availableOptions, newsPreferences, showToast]
  );

  return (
    <>
      <div className="setting-row setting-row--stack">
        <div>
          <label className="setting-row__label">News categories</label>
          <p className="setting-row__help">Pick the topics you want to see more of in your feed.</p>
        </div>
        <div className="preferences-grid">
          {availableOptions.map((option) => (
            <label key={option} className="checkbox-card">
              <input
                type="checkbox"
                checked={newsPreferences.selected.includes(option)}
                onChange={() => onTogglePreference(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <form className="setting-row setting-row--stack" onSubmit={onAddCustomOption}>
        <div>
          <label className="setting-row__label" htmlFor="news-custom">
            Add more
          </label>
          <p className="setting-row__help">
            Add a custom news topic and it will appear as a selectable preference.
          </p>
        </div>
        <div className="add-more-row">
          <input
            id="news-custom"
            className="add-more-input"
            type="text"
            value={customOption}
            onChange={(e) => setCustomOption(e.target.value)}
            placeholder="e.g. climate policy"
          />
          <button type="submit" className="btn-secondary" disabled={!customOption.trim()}>
            Add more
          </button>
        </div>
      </form>

      <div className="setting-row setting-row--stack">
        <div>
          <span className="setting-row__label">Selected preferences</span>
          <p className="setting-row__help">These tags show the news topics you currently have selected.</p>
        </div>
        <div className="tag-list">
          {newsPreferences.selected.length > 0 ? (
            newsPreferences.selected.map((option) => (
              <span key={option} className="tag">
                {option}
              </span>
            ))
          ) : (
            <p className="no-tags">No preferences selected yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default NewsPreferencesTab;
