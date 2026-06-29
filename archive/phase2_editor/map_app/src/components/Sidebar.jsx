import { RefreshCw } from 'lucide-react';

import { AppHeader } from './AppHeader';
import { SearchBox } from './SearchBox';
import { StatsGrid } from './StatsGrid';

export function Sidebar({
  error,
  query,
  stats,
  theme,
  visibleCount,
  onQueryChange,
  onThemeToggle,
}) {
  return (
    <aside className="sidebar">
      <AppHeader
        onThemeToggle={onThemeToggle}
        theme={theme}
      />
      <SearchBox query={query} onQueryChange={onQueryChange} />
      <StatsGrid stats={stats} visibleCount={visibleCount} />
      <button className="icon-button" onClick={() => window.location.reload()} type="button" title="Reload data">
        <RefreshCw size={18} aria-hidden="true" />
        Reload data
      </button>
      {error ? <p className="error-message">API error: {error}</p> : null}
    </aside>
  );
}
