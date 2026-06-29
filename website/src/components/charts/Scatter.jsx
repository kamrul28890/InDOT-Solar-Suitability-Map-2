import { formatNumber } from '../../utils/format';

const COLORS = ['#0F827E', '#B45309', '#2563EB', '#7C3AED'];

export function Scatter({ data, ariaLabel }) {
  const width = 520;
  const height = 300;
  const padding = 34;
  const maxArea = Math.max(1, ...data.map((row) => row.area || 0));

  return (
    <div className="chart-visual" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis-line" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis-line" />
        {data.map((row, index) => {
          const x = padding + row.x * (width - padding * 2);
          const y = height - padding - row.y * (height - padding * 2);
          const radius = 4 + Math.sqrt((row.area || 0) / maxArea) * 12;
          return (
            <circle
              key={row.id}
              cx={x}
              cy={y}
              r={radius}
              fill={COLORS[index % COLORS.length]}
              opacity="0.72"
              tabIndex="0"
            >
              <title>{`${row.label}: slope ${formatNumber(row.x, 2)}, solar ${formatNumber(row.y, 2)}`}</title>
            </circle>
          );
        })}
        <text x={width / 2} y={height - 4} textAnchor="middle" className="chart-label">
          Slope
        </text>
        <text x="12" y={height / 2} textAnchor="middle" className="chart-label" transform={`rotate(-90 12 ${height / 2})`}>
          Solar
        </text>
      </svg>
    </div>
  );
}
