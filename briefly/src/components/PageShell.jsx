import React from 'react';
import './PageShell.css';

/** Shared page chrome — use inside feature pages for consistent typography. */
export default function PageShell({ title, description, children }) {
  return (
    <article className="page-shell">
      <header className="page-shell__header">
        <h1 className="page-shell__title">{title}</h1>
        {description ? <p className="page-shell__desc">{description}</p> : null}
      </header>
      <div className="page-shell__body">{children}</div>
    </article>
  );
}
