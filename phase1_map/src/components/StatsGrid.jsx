export function StatsGrid({ stats, visibleCount }) {
  return (
    <section className="stats-grid">
      <div>
        <span>Visible</span>
        <strong>{visibleCount}</strong>
      </div>
      <div>
        <span>Total</span>
        <strong>{stats?.feature_count ?? 0}</strong>
      </div>
      <div>
        <span>Fixed Geometry</span>
        <strong>{stats?.fixed_geometries ?? 0}</strong>
      </div>
      <div>
        <span>Layers</span>
        <strong>{stats?.layer_count ?? 0}</strong>
      </div>
    </section>
  );
}
