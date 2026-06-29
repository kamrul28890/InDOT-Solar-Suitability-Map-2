const COLORS = ['#0C5C57', '#4FA8A6', '#F59E0B', '#7C3AED', '#2563EB', '#8A97A8'];

export function StackedBars({ data }) {
  return (
    <div className="stacked-bars" role="img" aria-label="Land cover composition by layer">
      {data.map((row) => (
        <div className="stacked-row" key={row.group}>
          <strong>{row.group.replace(/_/g, ' ')}</strong>
          <div className="stacked-track">
            {row.segments.map((segment, index) => (
              <span
                key={segment.bucket}
                style={{
                  width: `${Math.max(0, segment.pct)}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
                title={`${segment.bucket}: ${segment.pct.toFixed(1)}%`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
