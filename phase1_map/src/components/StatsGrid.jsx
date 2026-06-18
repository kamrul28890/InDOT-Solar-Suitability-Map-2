import { sidebarContent } from '../config/sidebarContent';

export function StatsGrid({ stats, visibleCount }) {
  const labels = sidebarContent.stats;

  return (
    <section className="stats-grid">
      <div>
        <span>{labels.visible}</span>
        <strong>{visibleCount}</strong>
      </div>
      <div>
        <span>{labels.total}</span>
        <strong>{stats?.feature_count ?? 0}</strong>
      </div>
      <div>
        <span>{labels.fixedGeometry}</span>
        <strong>{stats?.fixed_geometries ?? 0}</strong>
      </div>
      <div>
        <span>{labels.layers}</span>
        <strong>{stats?.layer_count ?? 0}</strong>
      </div>
    </section>
  );
}
