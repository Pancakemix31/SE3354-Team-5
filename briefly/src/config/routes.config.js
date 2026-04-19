/**
 * Central route map — teammates add a page component, import it here, and append
 * to MAIN_LAYOUT_ROUTES or AUTH_LAYOUT_ROUTES. Navigation picks up `label` + `group`
 * when `showInNav` is true.
 */
import HomePage from '../pages/feed/HomePage';
import TrendingPage from '../pages/feed/TrendingPage';
import ArticleDetailPage from '../pages/feed/ArticleDetailPage';
import LoginPage from '../pages/auth/LoginPage.js';
import RegisterPage from '../pages/auth/RegisterPage.js';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.js';
import ProfilePage from '../pages/account/ProfilePage';
import DeleteAccountPage from '../pages/account/DeleteAccountPage';
import NewsPreferencesPage from '../pages/preferences/NewsPreferencesPage';
import NotificationSettingsPage from '../pages/preferences/NotificationSettingsPage';
import SavedArticlesPage from '../pages/saved/SavedArticlesPage';
import SaveArticlePage from '../pages/saved/SaveArticlePage';
import ReadingHistoryPage from '../pages/saved/ReadingHistoryPage';
import SearchPage from '../pages/discovery/SearchPage';
import EngagementDashboardPage from '../pages/insights/EngagementDashboardPage';
import FeedbackPage from '../pages/settings/FeedbackPage';
import AppearancePage from '../pages/settings/AppearancePage';

/** Used by MainNav for section headings (order preserved). */
export const NAV_GROUPS = [
  { id: 'discover', label: 'Discover' },
  { id: 'library', label: 'Library' },
  { id: 'account', label: 'Account' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
];

/**
 * Routes rendered inside MainLayout (under `/`). Use `index: true` for `/`.
 * `path` is relative to `/` when not index.
 */
export const MAIN_LAYOUT_ROUTES = [
  { index: true, Component: HomePage, label: 'Home', group: 'discover', showInNav: true },
  { path: 'trending', Component: TrendingPage, label: 'Trending', group: 'discover', showInNav: true },
  { path: 'search', Component: SearchPage, label: 'Search', group: 'discover', showInNav: true },
  { path: 'article/:articleId', Component: ArticleDetailPage, label: null, group: null, showInNav: false },
  { path: 'saved', Component: SavedArticlesPage, label: 'Saved', group: 'library', showInNav: true },
  { path: 'save', Component: SaveArticlePage, label: 'Save article', group: 'library', showInNav: true },
  { path: 'history', Component: ReadingHistoryPage, label: 'History', group: 'library', showInNav: true },
  { path: 'profile', Component: ProfilePage, label: 'Profile', group: 'account', showInNav: true },
  { path: 'account/delete', Component: DeleteAccountPage, label: 'Delete account', group: 'account', showInNav: true },
  { path: 'preferences/news', Component: NewsPreferencesPage, label: 'News categories & regions', group: 'preferences', showInNav: true },
  { path: 'preferences/notifications', Component: NotificationSettingsPage, label: 'Notifications', group: 'preferences', showInNav: true },
  { path: 'insights', Component: EngagementDashboardPage, label: 'Engagement', group: 'insights', showInNav: true },
  { path: 'settings/feedback', Component: FeedbackPage, label: 'Feedback', group: 'settings', showInNav: true },
  { path: 'settings/appearance', Component: AppearancePage, label: 'Appearance', group: 'settings', showInNav: true },
];

/** Standalone auth screens (minimal chrome). */
export const AUTH_LAYOUT_ROUTES = [
  { path: 'login', Component: LoginPage, label: 'Log in' },
  { path: 'register', Component: RegisterPage, label: 'Register' },
  { path: 'reset-password', Component: ResetPasswordPage, label: 'Reset password' },
];
