import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SavedArticlesProvider } from './context/SavedArticlesContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ReadingListSummaryPage from './pages/ReadingListSummaryPage';
import SettingsPage from './pages/SettingsPage';
import ReadingListPage from './pages/ReadingListPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import ArticlePage from './pages/ArticlePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import './App.css';

/**
 * Routes:
 * - /login, /register — auth (no main chrome)
 * - Everything under MainLayout — Navbar + feature pages
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/summary" element={<ReadingListSummaryPage />} />
                <Route path="/saved" element={<ReadingListPage />} />
                <Route path="/articles/:articleId" element={<ArticlePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/account/delete" element={<DeleteAccountPage />} />
              </Route>
            </Routes>
          </div>
        </SavedArticlesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
