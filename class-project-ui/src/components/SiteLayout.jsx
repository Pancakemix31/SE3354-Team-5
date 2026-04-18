import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Shared shell: skip link, sticky top bar, routed page content, footer.
 * Child routes render inside <Outlet /> (hero + main are per-page).
 */
export default function SiteLayout() {
  return (
    <div className="site-root">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Navbar />

      <Outlet />

      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>
            <strong>Course:</strong> Software Engineering (SE3354)
          </p>
          <p>React + Vite — class project UI</p>
        </div>
      </footer>
    </div>
  );
}
