import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function PlaceholderPage({ eyebrow, title, description, nextLabel = 'Open the map', nextTo = '/map' }) {
  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <Card>
        <p>
          This page is wired into the redesigned static site shell. Its full implementation follows in the phase
          order from the build spec.
        </p>
      </Card>
      <div>
        <Button to={nextTo}>{nextLabel}</Button>
      </div>
    </section>
  );
}
