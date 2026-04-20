import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { SavedArticlesProvider } from './context/SavedArticlesContext';
import MainLayout from './layouts/MainLayout';
import RequireAuth from './layouts/RequireAuth';
import HomePage from './pages/HomePage';
import SummaryPage from './pages/SummaryPage';
import SettingsPage from './pages/SettingsPage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import TrendingPage from './pages/TrendingPage';
import NewsArticlePage from './pages/NewsArticlePage';
import AccountProfilePage from './pages/AccountProfilePage';
import LoginPage from './pages/auth/LoginPage.js';
import RegisterPage from './pages/auth/RegisterPage.js';
import './App.css';

/**
 * Public: / (landing), /login, /register
 * App shell + features: require authentication
 */
function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SavedArticlesProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>
                  <Route path="/news" element={<TrendingPage />} />
                  <Route path="/news/:articleId" element={<NewsArticlePage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                  <Route path="/profile" element={<AccountProfilePage />} />
                  <Route path="/summary" element={<SummaryPage />} />
                  <Route path="/saved" element={<SavedArticlesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/account/delete" element={<DeleteAccountPage />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </SavedArticlesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
