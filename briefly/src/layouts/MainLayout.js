import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

/**
 * Default app shell: navigation + scrollable main area for nested routes.
 */
function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
