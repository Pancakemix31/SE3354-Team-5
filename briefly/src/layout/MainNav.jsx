import React from 'react';
import { NavLink } from 'react-router-dom';
import { MAIN_LAYOUT_ROUTES, NAV_GROUPS } from '../config/routes.config';
import './MainNav.css';

function navPath(route) {
  if (route.index) return '/';
  return `/${route.path}`;
}

export default function MainNav() {
  const routesWithNav = MAIN_LAYOUT_ROUTES.filter((r) => r.showInNav && r.label);

  return (
    <nav className="main-nav" aria-label="Primary">
      {NAV_GROUPS.map((group) => {
        const items = routesWithNav.filter((r) => r.group === group.id);
        if (items.length === 0) return null;
        return (
          <div key={group.id} className="main-nav__group">
            <div className="main-nav__group-label">{group.label}</div>
            <ul className="main-nav__list">
              {items.map((route) => (
                <li key={route.path || 'index'}>
                  <NavLink
                    to={navPath(route)}
                    className={({ isActive }) =>
                      `main-nav__link${isActive ? ' main-nav__link--active' : ''}`
                    }
                    end={Boolean(route.index)}
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
