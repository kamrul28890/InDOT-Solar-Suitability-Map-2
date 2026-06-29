import { sidebarContent } from '../config/sidebarContent';

export function StatsGrid({ stats, visibleCount }) {
  // Show current filtered visibility beside source-wide manifest totals.
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
        <span>{labels.layers}</span>
        <strong>{stats?.layer_count ?? 0}</strong>
      </div>
    </section>
  );
}
