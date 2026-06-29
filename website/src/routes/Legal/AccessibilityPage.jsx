import { Card } from '../../components/Card';

export default function AccessibilityPage() {
  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Accessibility</span>
        <h1>Accessibility statement</h1>
        <p>
          This static website is designed with semantic landmarks, visible focus states, keyboard-accessible controls,
          responsive layouts, and high-contrast light and dark themes.
        </p>
      </header>
      <Card>
        <p>
          If you encounter an accessibility barrier, contact s2hublab@gmail.com with the page URL, browser, assistive
          technology if relevant, and a short description of the issue.
        </p>
      </Card>
    </section>
  );
}
