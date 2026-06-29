import { Card } from '../../components/Card';

export default function CitationPage() {
  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Citation</span>
        <h1>Cite this site</h1>
        <p>Please cite the web application and processed data when reusing the published outputs.</p>
      </header>
      <Card>
        <p>
          S2-HUB Lab, Purdue University (2026). <em>INDOT Solar Suitability Map (SPR 4862 / Indiana Solar Roadmap)</em>{' '}
          [Data set / Web application].
        </p>
      </Card>
    </section>
  );
}
