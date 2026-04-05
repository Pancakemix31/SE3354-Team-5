import { Routes, Route } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import SummaryPage from './pages/SummaryPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Route table: home hub, AI summary article, notification settings.
 * Layout wraps every page with the shared chrome (nav + footer).
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
