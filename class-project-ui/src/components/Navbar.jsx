import { NavLink } from 'react-router-dom';

function linkClass({ isActive }) {
  return isActive ? 'is-active' : undefined;
}

/**
 * Sticky product header with route-aware links.
 */
export default function Navbar() {
  return (
    <header className="site-topbar">
      <div className="site-topbar__inner">
        <NavLink to="/" className="site-brand" end>
          <span className="site-brand__mark" aria-hidden="true">
            B
          </span>
          <span className="site-brand__text">
            Briefly Wire
            <span>SE3354 · Demo news product</span>
          </span>
        </NavLink>
        <nav className="topbar-nav" aria-label="Primary">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/summary" className={linkClass}>
            Read &amp; summarize
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Notifications
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
