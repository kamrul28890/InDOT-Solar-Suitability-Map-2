import { CRITERIA } from '../config/criteria';
import { scoreToColor } from '../utils/colorScale';
import { formatNumber } from '../utils/format';

export function ScoreBars({ feature }) {
  const properties = feature?.properties || {};

  return (
    <div className="score-bars" aria-label="Seven suitability sub-scores">
      {CRITERIA.map((criterion) => {
        const value = Number(properties[criterion.key]);
        const hasValue = Number.isFinite(value);
        return (
          <div className="score-bar" key={criterion.key}>
            <div className="score-bar__label">
              <span>{criterion.short}</span>
              <strong>{hasValue ? formatNumber(value, 2) : 'n/a'}</strong>
            </div>
            <div className="score-bar__track" aria-hidden="true">
              <span
                style={{
                  width: `${hasValue ? Math.max(0, Math.min(1, value)) * 100 : 0}%`,
                  backgroundColor: hasValue ? scoreToColor(value) : 'var(--text-muted)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
