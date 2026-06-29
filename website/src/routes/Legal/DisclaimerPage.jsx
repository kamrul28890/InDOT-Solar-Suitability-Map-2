import { Card } from '../../components/Card';

export default function DisclaimerPage() {
  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Disclaimer</span>
        <h1>Screening tool disclaimer</h1>
        <p>
          The INDOT Solar Suitability Map is a research decision-support and screening tool. It is not a final siting,
          engineering, permitting, procurement, or interconnection decision.
        </p>
      </header>
      <Card>
        <p>
          Published suitability sub-scores should be interpreted alongside expert review and site-specific due
          diligence. Some upstream data sources and normalization details remain TODO(confirm) until the lab documents
          the analyst processing notes.
        </p>
      </Card>
    </section>
  );
}
