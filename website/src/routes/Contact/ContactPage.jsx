import { useMemo, useState } from 'react';

import { Card } from '../../components/Card';
import { siteContent } from '../../config/siteContent';

export default function ContactPage() {
  const [status, setStatus] = useState('');
  const hasKey = siteContent.contact.web3formsKey && !siteContent.contact.web3formsKey.includes('TODO');
  const mailto = useMemo(() => {
    const subject = encodeURIComponent('INDOT Solar Suitability Map question');
    const body = encodeURIComponent('Name:\nEmail:\nMessage:\n');
    return `mailto:${siteContent.contact.email}?subject=${subject}&body=${body}`;
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!hasKey) {
      window.location.href = mailto;
      return;
    }

    const formData = new FormData(form);
    formData.set('access_key', siteContent.contact.web3formsKey);
    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
      setStatus('Message sent.');
      form.reset();
    } else {
      setStatus('Message could not be sent. Please use the email link below.');
    }
  }

  return (
    <section className="site-page contact-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Contact</span>
        <h1>Feedback or data questions</h1>
        <p>Send map questions to the S2-HUB Lab. The fallback email link works even before the Web3Forms key is added.</p>
      </header>

      <Card>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="hidden" name="access_key" value={hasKey ? siteContent.contact.web3formsKey : ''} readOnly />
          <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" className="sr-only" />
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            Subject
            <input name="subject" required defaultValue="INDOT Solar Suitability Map question" />
          </label>
          <label>
            Message
            <textarea name="message" required rows="6" />
          </label>
          <button className="ui-button ui-button--primary" type="submit">
            {hasKey ? 'Send message' : 'Open email draft'}
          </button>
          {status ? <p className="status-message">{status}</p> : null}
        </form>
      </Card>

      <Card>
        <h3>S2-HUB Lab</h3>
        <p>
          Email: <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a>
        </p>
        <p>Dr. Soowon Chang: chang776@purdue.edu</p>
        <p>Dudley Hall 4564, 363 N. Grant St., West Lafayette, IN 47907</p>
        <p>{siteContent.contact.privacyNote}</p>
      </Card>
    </section>
  );
}
