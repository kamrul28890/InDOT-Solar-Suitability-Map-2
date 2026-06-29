import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { CRITERIA } from '../../config/criteria';

export default function CriteriaPage() {
  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Criteria</span>
        <h1>Seven independent suitability criteria</h1>
        <p>
          The Indiana Solar Roadmap presents each screening parameter as an independent 0-1 sub-score. The website
          does not combine them into a composite or overall suitability score.
        </p>
      </header>

      <Card>
        <p>
          Scores are interpreted as higher = more suitable within each criterion. Users decide which criterion matters
          for the current planning question, such as low slope for less earthwork or flood score for lower exposure.
        </p>
      </Card>

      <SectionHeader
        eyebrow="Criteria"
        title="What each sub-score measures"
        description="Source-provider details marked TODO(confirm) are intentionally not invented until the lab confirms the upstream processing notes."
      />
      <div className="method-table-wrap">
        <table className="content-table">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Measures</th>
              <th>Backing attribute</th>
              <th>Direction</th>
              <th>Source status</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((criterion) => (
              <tr key={criterion.key}>
                <td>{criterion.label}</td>
                <td>{criterion.measures}</td>
                <td>{criterion.attribute || 'Derived sub-score'}</td>
                <td>{criterion.direction}</td>
                <td>{criterion.sourceConfirmed ? criterion.sourceNote : 'source: to be documented'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <h3>Data lineage</h3>
        <p>
          Source shapefiles are exported by <code>export_app_data.py</code>, reprojected to EPSG:4326, validated for
          browser rendering, and published as GeoJSON plus a manifest. Maintainer-only provenance fields are retained
          in the data package, but the public map focuses on screening attributes.
        </p>
      </Card>

      <Card>
        <h3>Limitations</h3>
        <p>
          This is a screening and decision-support tool used alongside expert judgment, not a final siting decision.
          Site-specific factors such as roof condition and interconnection are not fully captured. Representative
          center points are derived from geometry; raw <code>Lat</code>/<code>Long</code> source fields are placeholder
          zeros and are not used for placement.
        </p>
      </Card>
    </section>
  );
}
