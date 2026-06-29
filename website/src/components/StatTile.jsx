import { Card } from './Card';

export function StatTile({ label, value, suffix = '', description }) {
  return (
    <Card className="stat-tile">
      <span>{label}</span>
      <strong>
        {value}
        {suffix}
      </strong>
      {description ? <p>{description}</p> : null}
    </Card>
  );
}
