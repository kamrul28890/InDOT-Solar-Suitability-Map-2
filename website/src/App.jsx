import { useEffect, useMemo, useReducer, useState } from 'react';

import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { CRITERIA_BY_KEY } from './config/criteria';
import { layerLookup } from './config/displayDefaults';
import { BASEMAP_STORAGE_KEY, DETAIL_ZOOM, basemapLayers } from './config/mapConfig';
import { CriterionTable } from './map/CriterionTable';
import { SiteDetailPanel } from './map/SiteDetailPanel';
import { DEFAULT_FILTERS, filterFeatures, filterLayers, siteFilterReducer } from './map/useSiteFilters';
import { loadAppData } from './services/api';
import { featureCenter, featureKey, siteLabel } from './utils/features';
import { featureMatches, groupFeaturesByLayer } from './utils/search';
import { findScoredFeatureForSelection } from './utils/selection';
import { parseMapState } from './utils/shareLinks';

function storedBasemapId() {
  // Access localStorage only in a browser and reject values removed from config.
  if (typeof window === 'undefined') {
    return 'osm';
  }
  const value = window.localStorage.getItem(BASEMAP_STORAGE_KEY);
  return basemapLayers.some((layer) => layer.id === value) ? value : 'osm';
}

export function App() {
  // Source data is loaded once; the remaining state represents user display,
  // search, map focus, and theme choices.
  const [manifest, setManifest] = useState(null);
  const [stats, setStats] = useState(null);
  const [layers, setLayers] = useState({});
  const [enabled, setEnabled] = useState({});
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState(null);
  const [theme, setTheme] = useState('light');
  const [zoom, setZoom] = useState(7);
  const [basemapId, setBasemapId] = useState(storedBasemapId);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const initialMapState = useMemo(() => (typeof window === 'undefined' ? {} : parseMapState(window.location.hash)), []);
  const [activeCriterion, setActiveCriterion] = useState(CRITERIA_BY_KEY[initialMapState.color] ? initialMapState.color : '');
  const [filters, dispatchFilters] = useReducer(siteFilterReducer, {
    ...DEFAULT_FILTERS,
    district: initialMapState.district || '',
  });
  const [viewMode, setViewMode] = useState(initialMapState.view === 'table' ? 'table' : 'map');

  useEffect(() => {
    // Persist the basemap preference independently from project data.
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BASEMAP_STORAGE_KEY, basemapId);
    }
  }, [basemapId]);

  useEffect(() => {
    // Manifest, statistics, and all GeoJSON layers load as one coherent snapshot
    // from either the API or static deployment adapter.
    async function load() {
      try {
        setLoading(true);
        setError('');
        const appData = await loadAppData();
        setManifest(appData.manifest);
        setStats(appData.stats);
        setLayers(appData.layers);
        setEnabled(Object.fromEntries((appData.manifest?.layers || []).map((layer) => [layer.name, true])));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLayers = useMemo(() => filterLayers(layers, filters), [filters, layers]);
  const allFilteredFeatures = useMemo(() => filterFeatures(layers, filters), [filters, layers]);

  const visibleLayers = useMemo(() => {
    // Preserve GeoJSON layer metadata while replacing features with the current
    // enabled/search-filtered subset consumed by the map renderer.
    return Object.entries(filteredLayers).flatMap(([name, geojson]) => {
      if (!enabled[name]) {
        return [];
      }
      return [[
        name,
        {
          ...geojson,
          features: geojson.features.filter((feature) => featureMatches(feature, query)),
        },
      ]];
    });
  }, [enabled, filteredLayers, query]);

  const visibleCount = visibleLayers.reduce((sum, [, layer]) => sum + layer.features.length, 0);
  const directoryLayers = useMemo(() => groupFeaturesByLayer(filteredLayers, manifest, query), [filteredLayers, manifest, query]);
  const layerConfigByName = useMemo(() => layerLookup(manifest), [manifest]);
  const activeBasemap = basemapLayers.find((layer) => layer.id === basemapId) || basemapLayers[0];
  const showDetailShapes = zoom >= DETAIL_ZOOM;
  const visibleFeatures = useMemo(() => visibleLayers.flatMap(([, layer]) => layer.features), [visibleLayers]);

  useEffect(() => {
    if (!initialMapState.site || !Object.keys(layers).length || selectedSite) {
      return;
    }
    const match = Object.entries(layers)
      .flatMap(([name, geojson]) => (geojson.features || []).map((feature, index) => [name, feature, index]))
      .find(([, feature]) => String(feature.properties?.SPR_ID) === initialMapState.site);
    if (match) {
      const [name, feature, index] = match;
      selectSite(feature, `${name}:${feature.properties?.SPR_ID || index}`);
    }
  }, [initialMapState.site, layers, selectedSite]);

  function handleLayerToggle(layerName, checked) {
    setEnabled((current) => ({ ...current, [layerName]: checked }));
  }

  function selectSite(feature, key, targetZoom = DETAIL_ZOOM) {
    // Directory/search selection also enables the feature's layer and requests
    // a map fly-to target, keeping sidebar and map state synchronized.
    const selectableFeature = findScoredFeatureForSelection(feature, visibleLayers);
    const selectableLayerConfig = layerConfigByName[selectableFeature.properties.dataset] || {};
    const selectableKey = selectableFeature === feature ? key : featureKey(selectableFeature, 0, selectableLayerConfig);
    const center = featureCenter(selectableFeature);
    if (!center) {
      return;
    }

    setEnabled((current) => ({ ...current, [selectableFeature.properties.dataset]: true }));
    setSelectedSite({
      key: selectableKey,
      feature: selectableFeature,
      latitude: center.latitude,
      longitude: center.longitude,
      label: siteLabel(selectableFeature, selectableLayerConfig),
      targetZoom,
      activeCriterion,
    });
  }

  function handleLegendBand(criterion, range) {
    if (!criterion) {
      return;
    }
    dispatchFilters({ type: 'criterionRange', key: criterion, range });
  }

  function handleLocateUser() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Location is not available in this browser.');
      return;
    }

    setLocationStatus('Requesting browser location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          requestedAt: Date.now(),
        });
        setLocationStatus(`Location found. Accuracy about ${Math.round(position.coords.accuracy)} m.`);
        setViewMode('map');
      },
      (geoError) => {
        setLocationStatus(geoError.message || 'Location permission was denied or unavailable.');
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 12000 }
    );
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <Sidebar
        activeCriterion={activeCriterion}
        allFeatures={allFilteredFeatures}
        basemapId={basemapId}
        directoryLayers={directoryLayers}
        enabled={enabled}
        error={error}
        filters={filters}
        loading={loading}
        onCriterionChange={setActiveCriterion}
        onBasemapChange={setBasemapId}
        onFilterAction={dispatchFilters}
        onLegendBand={handleLegendBand}
        onLocateUser={handleLocateUser}
        onLayerToggle={handleLayerToggle}
        onQueryChange={setQuery}
        onSiteSelect={selectSite}
        onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        query={query}
        selectedSite={selectedSite}
        stats={stats}
        theme={theme}
        visibleCount={visibleCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        locationStatus={locationStatus}
      />
      <section className="map-workspace">
        {viewMode === 'table' ? (
          <CriterionTable features={visibleFeatures} layerConfigByName={layerConfigByName} onSelectSite={selectSite} />
        ) : (
          <MapView
            activeBasemap={activeBasemap}
            activeCriterion={activeCriterion}
            error={error}
            loading={loading}
            onSelectSite={selectSite}
            resolveFeatureForSelection={(feature) => findScoredFeatureForSelection(feature, visibleLayers)}
            onZoomChange={setZoom}
            query={query}
            selectedSite={selectedSite}
            showDetailShapes={showDetailShapes}
            userLocation={userLocation}
            manifest={manifest}
            visibleLayers={visibleLayers}
          />
        )}
        <SiteDetailPanel
          layerConfig={layerConfigByName[selectedSite?.feature?.properties?.dataset] || {}}
          locationStatus={locationStatus}
          onClose={() => setSelectedSite(null)}
          onLocateUser={handleLocateUser}
          onZoomTo={(feature) => selectSite(feature, selectedSite.key)}
          selectedSite={selectedSite}
          userLocation={userLocation}
        />
      </section>
    </main>
  );
}
