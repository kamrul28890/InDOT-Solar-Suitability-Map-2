import { useEffect, useMemo, useState } from 'react';

import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { BASEMAP_STORAGE_KEY, DETAIL_ZOOM, basemapLayers } from './config/mapConfig';
import { loadAppData } from './services/api';
import { featureBounds, featureCenter, siteLabel } from './utils/features';
import { featureMatches, groupFeaturesByLayer } from './utils/search';

const initialEnabledLayers = {
  all_candidate_sites: true,
  facility_scored: true,
  row_scored: true,
};

function storedBasemapId() {
  if (typeof window === 'undefined') {
    return 'osm';
  }
  const value = window.localStorage.getItem(BASEMAP_STORAGE_KEY);
  return basemapLayers.some((layer) => layer.id === value) ? value : 'osm';
}

export function App() {
  const [manifest, setManifest] = useState(null);
  const [stats, setStats] = useState(null);
  const [layers, setLayers] = useState({});
  const [enabled, setEnabled] = useState(initialEnabledLayers);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedSite, setSelectedSite] = useState(null);
  const [theme, setTheme] = useState('light');
  const [zoom, setZoom] = useState(7);
  const [basemapId, setBasemapId] = useState(storedBasemapId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BASEMAP_STORAGE_KEY, basemapId);
    }
  }, [basemapId]);

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const appData = await loadAppData();
        setManifest(appData.manifest);
        setStats(appData.stats);
        setLayers(appData.layers);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  const visibleLayers = useMemo(() => {
    return Object.entries(layers).flatMap(([name, geojson]) => {
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
  }, [enabled, layers, query]);

  const visibleCount = visibleLayers.reduce((sum, [, layer]) => sum + layer.features.length, 0);
  const directoryLayers = useMemo(() => groupFeaturesByLayer(layers, manifest, query), [layers, manifest, query]);
  const activeBasemap = basemapLayers.find((layer) => layer.id === basemapId) || basemapLayers[0];
  const showDetailShapes = zoom >= DETAIL_ZOOM;

  function handleLayerToggle(layerName, checked) {
    setEnabled((current) => ({ ...current, [layerName]: checked }));
  }

  function selectSite(feature, key, targetZoom = DETAIL_ZOOM) {
    const center = featureCenter(feature);
    if (!center) {
      return;
    }

    setEnabled((current) => ({ ...current, [feature.properties.dataset]: true }));
    setSelectedSite({
      key,
      bounds: featureBounds(feature),
      latitude: center.latitude,
      longitude: center.longitude,
      label: siteLabel(feature),
      targetZoom,
    });
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <Sidebar
        error={error}
        onQueryChange={setQuery}
        onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        query={query}
        stats={stats}
        theme={theme}
        visibleCount={visibleCount}
      />
      <MapView
        activeBasemap={activeBasemap}
        basemapId={basemapId}
        enabled={enabled}
        layerControls={directoryLayers}
        onBasemapChange={setBasemapId}
        onLayerToggle={handleLayerToggle}
        onSelectSite={selectSite}
        onZoomChange={setZoom}
        query={query}
        selectedSite={selectedSite}
        showDetailShapes={showDetailShapes}
        visibleLayers={visibleLayers}
      />
    </main>
  );
}
