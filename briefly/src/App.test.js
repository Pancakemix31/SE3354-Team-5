import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { FEATURED_ARTICLE } from './data/articles';
import { FORCE_INSERT_ERROR_KEY } from './lib/savedArticlesStorage';

const USERS_KEY = 'briefly_users';
const SESSION_KEY = 'briefly_session';
const SAVED_KEY = 'briefly_saved_articles_v1';

function seedAuthenticatedUser() {
  window.localStorage.setItem(
    USERS_KEY,
    JSON.stringify([{ name: 'Test User', email: 'reader@briefly.app', password: 'pw' }])
  );
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'reader@briefly.app' }));
}

function seedSavedArticles(recordsByEmail) {
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(recordsByEmail));
}

function setRoute(pathname) {
  window.history.pushState({}, '', pathname);
}

function setOnline(value) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

beforeEach(() => {
  window.localStorage.clear();
  setOnline(true);
});

test('renders home headline', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /read what matters/i })).toBeInTheDocument();
});

test('TC-01 saves an article and shows a confirmation toast', async () => {
  seedAuthenticatedUser();
  setRoute('/summary');
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: /save article/i }));

  expect(await screen.findByText(/article added to your reading list/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^saved$/i })).toBeDisabled();

  const stored = JSON.parse(window.localStorage.getItem(SAVED_KEY));
  expect(stored['reader@briefly.app'][0]).toMatchObject({
    id: FEATURED_ARTICLE.id,
    title: FEATURED_ARTICLE.title,
    source: FEATURED_ARTICLE.source,
  });
});

test('TC-02 opens reading list and shows headline, source, and save date', async () => {
  seedAuthenticatedUser();
  seedSavedArticles({
    'reader@briefly.app': [
      {
        ...FEATURED_ARTICLE,
        savedAt: '2026-04-05T12:00:00.000Z',
      },
    ],
    'other@briefly.app': [
      {
        ...FEATURED_ARTICLE,
        id: 'other-story',
        title: 'Other user article',
        savedAt: '2026-04-05T12:00:00.000Z',
      },
    ],
  });
  setRoute('/saved');
  render(<App />);

  expect(screen.getByRole('heading', { name: /reading list/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: FEATURED_ARTICLE.title })).toBeInTheDocument();
  expect(screen.getByText(/reuters/i)).toBeInTheDocument();
  expect(screen.getByText(/apr 5, 2026/i)).toBeInTheDocument();
  expect(screen.queryByText(/other user article/i)).not.toBeInTheDocument();
});

test('TC-03 opens a saved article and renders full content', async () => {
  seedAuthenticatedUser();
  seedSavedArticles({
    'reader@briefly.app': [
      {
        ...FEATURED_ARTICLE,
        savedAt: '2026-04-05T12:00:00.000Z',
      },
    ],
  });
  setRoute('/saved');
  render(<App />);

  await userEvent.click(screen.getByRole('link', { name: /open article/i }));
  expect(screen.getByText(/fetching full article content/i)).toBeInTheDocument();

  expect(await screen.findByRole('heading', { name: FEATURED_ARTICLE.title })).toBeInTheDocument();
  expect(screen.getByText(/machine-learning controls that adjust cooling equipment/i)).toBeInTheDocument();
});

test('TC-04 removes a saved article from the reading list', async () => {
  seedAuthenticatedUser();
  seedSavedArticles({
    'reader@briefly.app': [
      {
        ...FEATURED_ARTICLE,
        savedAt: '2026-04-05T12:00:00.000Z',
      },
    ],
  });
  setRoute('/saved');
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: /remove/i }));

  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: FEATURED_ARTICLE.title })).not.toBeInTheDocument();
  });
  expect(screen.getByText(/article removed from your reading list/i)).toBeInTheDocument();
});

test('TC-05 retries queued saves when the device comes back online', async () => {
  seedAuthenticatedUser();
  setOnline(false);
  setRoute('/summary');
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: /save article/i }));
  expect(await screen.findByText(/will sync automatically when you reconnect/i)).toBeInTheDocument();

  setOnline(true);
  act(() => {
    window.dispatchEvent(new Event('online'));
  });

  await waitFor(() => {
    const stored = JSON.parse(window.localStorage.getItem(SAVED_KEY));
    expect(stored['reader@briefly.app'][0].id).toBe(FEATURED_ARTICLE.id);
  });
});

test('TC-06 shows an error and does not add the article when insert fails', async () => {
  seedAuthenticatedUser();
  window.localStorage.setItem(FORCE_INSERT_ERROR_KEY, JSON.stringify(true));
  setRoute('/summary');
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: /save article/i }));

  expect(await screen.findByText(/unable to save this article right now/i)).toBeInTheDocument();
  expect(window.localStorage.getItem(SAVED_KEY)).toBeNull();
});
