import { scoreToColor } from '../../utils/colorScale';
import { formatNumber } from '../../utils/format';
import { ChartTable } from './BarChart';

export function HBars({ data, onBarClick, ariaLabel }) {
  const sorted = [...data].sort((a, b) => (b.mean ?? -1) - (a.mean ?? -1));
  return (
    <div className="hbars" role="img" aria-label={ariaLabel}>
      {sorted.map((row) => (
        <button className="hbar-row" key={row.key} onClick={() => onBarClick?.(row)} type="button">
          <span>{row.label}</span>
          <span className="hbar-track">
            <span style={{ width: `${(row.mean ?? 0) * 100}%`, backgroundColor: scoreToColor(row.mean) }} />
          </span>
          <strong>{row.mean === null ? 'n/a' : formatNumber(row.mean, 2)}</strong>
        </button>
      ))}
      <ChartTable data={sorted} labelKey="label" valueKey="mean" />
    </div>
  );
}
