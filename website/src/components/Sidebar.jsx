import { RefreshCw } from 'lucide-react';

import { AppHeader } from './AppHeader';
import { LayerDirectory } from './LayerDirectory';
import { ProjectInfo } from './ProjectInfo';
import { SearchBox } from './SearchBox';
import { StatsGrid } from './StatsGrid';
import { FilterPanel } from '../map/FilterPanel';
import { InteractiveLegend } from '../map/InteractiveLegend';
import { MapToolbar } from '../map/MapToolbar';

export function Sidebar({
  activeCriterion,
  allFeatures,
  basemapId,
  directoryLayers,
  enabled,
  error,
  filters,
  loading,
  query,
  selectedSite,
  stats,
  theme,
  visibleCount,
  onBasemapChange,
  onCriterionChange,
  onFilterAction,
  onLegendBand,
  onLocateUser,
  onLayerToggle,
  onQueryChange,
  onSiteSelect,
  onThemeToggle,
  onViewModeChange,
  viewMode,
  locationStatus,
}) {
  // Compose project controls in workflow order: display settings, search, layer
  // navigation, statistics, reload, and project context.
  return (
    <aside className="sidebar">
      <AppHeader
        basemapId={basemapId}
        onBasemapChange={onBasemapChange}
        onThemeToggle={onThemeToggle}
        theme={theme}
      />
      <SearchBox query={query} onQueryChange={onQueryChange} />
      <MapToolbar locationStatus={locationStatus} mode={viewMode} onLocateUser={onLocateUser} onModeChange={onViewModeChange} />
      <FilterPanel
        activeCriterion={activeCriterion}
        features={allFeatures}
        filters={filters}
        onCriterionChange={onCriterionChange}
        onFilterAction={onFilterAction}
      />
      <InteractiveLegend activeCriterion={activeCriterion} onBandSelect={onLegendBand} />
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
      <ProjectInfo />
      {loading ? <p className="status-message">Loading map data...</p> : null}
      {error ? <p className="error-message">Data load error: {error}</p> : null}
    </aside>
  );
}
