import { CRITERIA_BY_KEY } from '../config/criteria';
import { scoreToColor } from '../utils/colorScale';

const BANDS = [
  { label: '0.00-0.20', range: [0, 0.2], midpoint: 0.1 },
  { label: '0.20-0.40', range: [0.2, 0.4], midpoint: 0.3 },
  { label: '0.40-0.60', range: [0.4, 0.6], midpoint: 0.5 },
  { label: '0.60-0.80', range: [0.6, 0.8], midpoint: 0.7 },
  { label: '0.80-1.00', range: [0.8, 1], midpoint: 0.9 },
];

export function InteractiveLegend({ activeCriterion, onBandSelect }) {
  const criterion = CRITERIA_BY_KEY[activeCriterion];

  if (!criterion) {
    return (
      <section className="map-card">
        <div className="map-card__header">
          <span className="site-eyebrow">Map color</span>
          <h2>Layer colors</h2>
        </div>
        <p className="legend-note">
          The map is using the standard layer colors. Choose a criterion above to color scored sites with the suitability
          ramp.
        </p>
      </section>
    );
  }

  return (
    <section className="map-card">
      <div className="map-card__header">
        <span className="site-eyebrow">Criterion color</span>
        <h2>{criterion?.label || 'Score'}</h2>
      </div>
      <div className="legend-bands" aria-label={`Legend for ${criterion?.label || 'active criterion'}`}>
        {BANDS.map((band) => (
          <button key={band.label} onClick={() => onBandSelect?.(activeCriterion, band.range)} type="button">
            <span style={{ backgroundColor: scoreToColor(band.midpoint) }} />
            {band.label}
          </button>
        ))}
      </div>
      <p className="legend-note">Candidate sites without scores render in their layer color. Click a band to filter.</p>
    </section>
  );
}
