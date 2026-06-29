function splitLabel(label) {
  const text = String(label);
  const parts = text.split(/\s+/);
  if (parts.length > 1) {
    return parts.slice(0, 2);
  }
  if (text.length <= 10) {
    return [text];
  }
  const breakPoint = Math.ceil(text.length / 2);
  return [text.slice(0, breakPoint), text.slice(breakPoint, breakPoint * 2)];
}

export function BarChart({ data, labelKey = 'label', valueKey = 'value', onBarClick, ariaLabel }) {
  const max = Math.max(1, ...data.map((row) => Number(row[valueKey]) || 0));
  const width = 520;
  const height = 292;
  const padding = { top: 18, right: 18, bottom: 86, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const gap = 10;
  const barWidth = data.length ? (innerWidth - gap * (data.length - 1)) / data.length : 0;

  return (
    <div className="chart-visual" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {data.map((row, index) => {
          const value = Number(row[valueKey]) || 0;
          const barHeight = (value / max) * innerHeight;
          const x = padding.left + index * (barWidth + gap);
          const y = padding.top + innerHeight - barHeight;
          return (
            <g key={row[labelKey]} tabIndex="0" onClick={() => onBarClick?.(row)}>
              <title>{`${row[labelKey]}: ${value}`}</title>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill="var(--scale-4)" />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="chart-value">
                {value}
              </text>
              <text x={x + barWidth / 2} y={height - 48} textAnchor="middle" className="chart-label chart-label--bar">
                {splitLabel(row[labelKey]).map((part, lineIndex) => (
                  <tspan key={part} x={x + barWidth / 2} dy={lineIndex === 0 ? 0 : 14}>
                    {part}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTable data={data} labelKey={labelKey} valueKey={valueKey} />
    </div>
  );
}

export function ChartTable({ data, labelKey, valueKey }) {
  return (
    <table className="sr-only">
      <tbody>
        {data.map((row) => (
          <tr key={row[labelKey]}>
            <th>{row[labelKey]}</th>
            <td>{row[valueKey]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
