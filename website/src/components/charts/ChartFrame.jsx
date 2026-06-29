import { Card } from '../Card';

export function ChartFrame({ children, description, eyebrow, title }) {
  return (
    <Card className="chart-card">
      <span className="site-eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </Card>
  );
}
