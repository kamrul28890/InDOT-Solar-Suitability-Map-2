import { RefreshCw } from 'lucide-react';

import { AppHeader } from './AppHeader';
import { LayerDirectory } from './LayerDirectory';
import { SearchBox } from './SearchBox';
import { StatsGrid } from './StatsGrid';

export function Sidebar({
  basemapId,
  directoryLayers,
  enabled,
  error,
  query,
  selectedSite,
  stats,
  theme,
  visibleCount,
  onBasemapChange,
  onLayerToggle,
  onQueryChange,
  onSiteSelect,
  onThemeToggle,
}) {
  return (
    <aside className="sidebar">
      <AppHeader
        basemapId={basemapId}
        onBasemapChange={onBasemapChange}
        onThemeToggle={onThemeToggle}
        theme={theme}
      />
      <SearchBox query={query} onQueryChange={onQueryChange} />
      <LayerDirectory
        directoryLayers={directoryLayers}
        enabled={enabled}
        onLayerToggle={onLayerToggle}
        onSiteSelect={onSiteSelect}
        selectedSite={selectedSite}
      />
      <StatsGrid stats={stats} visibleCount={visibleCount} />
      <button className="icon-button" onClick={() => window.location.reload()} type="button" title="Reload data">
        <RefreshCw size={18} aria-hidden="true" />
        Reload data
      </button>
      {error ? <p className="error-message">API error: {error}</p> : null}
    </aside>
  );
}
