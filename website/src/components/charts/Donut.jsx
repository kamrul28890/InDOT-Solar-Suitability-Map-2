const COLORS = ['#0C5C57', '#4FA8A6', '#F59E0B', '#7C3AED', '#2563EB', '#8A97A8'];

export function Donut({ data, labelKey = 'label', valueKey = 'value' }) {
  const total = data.reduce((sum, row) => sum + (Number(row[valueKey]) || 0), 0) || 1;
  let offset = 25;

  return (
    <div className="donut-wrap" role="img" aria-label="Inventory composition">
      <svg viewBox="0 0 220 220" aria-hidden="true">
        {data.map((row, index) => {
          const value = Number(row[valueKey]) || 0;
          const dash = (value / total) * 100;
          const circle = (
            <circle
              key={row[labelKey]}
              cx="110"
              cy="110"
              r="72"
              fill="none"
              stroke={COLORS[index % COLORS.length]}
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={offset}
              strokeWidth="26"
            >
              <title>{`${row[labelKey]}: ${value}`}</title>
            </circle>
          );
          offset -= dash;
          return circle;
        })}
        <text x="110" y="104" textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x="110" y="126" textAnchor="middle" className="chart-label">
          sites
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((row, index) => (
          <span key={row[labelKey]}>
            <i style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            {row[labelKey]} ({row[valueKey]})
          </span>
        ))}
      </div>
    </div>
  );
}
