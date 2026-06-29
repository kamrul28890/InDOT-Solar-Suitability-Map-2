import { scoreToColor } from '../../utils/colorScale';
import { formatNumber } from '../../utils/format';
import { Fragment } from 'react';

const HEATMAP_LABELS = {
  sol_s: 'Solar',
  slp_s: 'Slope',
  trn_s: 'Trans.',
  evp_s: 'ET',
  dem_s: 'Elev.',
  fld_s: 'Flood',
  lc_s: 'Cover',
};

export function Heatmap({ matrix }) {
  return (
    <div className="heatmap" role="img" aria-label="District by criterion mean score heatmap">
      <div className="heatmap__corner" />
      {matrix.criteria.map((criterion) => (
        <div className="heatmap__head" key={criterion.key} title={criterion.label}>
          {HEATMAP_LABELS[criterion.key] || criterion.short}
        </div>
      ))}
      {matrix.districts.map((district) => (
        <Fragment key={district}>
          <div className="heatmap__rowhead" key={`${district}-label`}>
            {district}
          </div>
          {matrix.criteria.map((criterion) => {
            const cell = matrix.cells[district][criterion.key];
            return (
              <div
                className={`heatmap__cell ${cell.mean === null ? 'is-empty' : ''}`}
                key={`${district}-${criterion.key}`}
                style={{ backgroundColor: cell.mean === null ? 'var(--surface-2)' : scoreToColor(cell.mean) }}
                tabIndex="0"
              >
                <span>{cell.mean === null ? 'n/a' : formatNumber(cell.mean, 2)}</span>
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
