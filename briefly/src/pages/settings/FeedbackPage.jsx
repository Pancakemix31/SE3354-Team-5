import React, { useState } from 'react';
import PageShell from '../../components/PageShell';

/** General platform feedback form. */
export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <PageShell title="Feedback" description="Tell us what works and what does not.">
      {sent ? (
        <p className="auth-page__message">Thanks — feedback recorded (placeholder).</p>
      ) : (
        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="stack-form__label">
            Your message
            <textarea
              className="stack-form__input stack-form__textarea"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-primary">
            Submit
          </button>
        </form>
      )}
    </PageShell>
  );
}
