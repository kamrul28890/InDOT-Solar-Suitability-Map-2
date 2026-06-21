import { useEffect, useMemo, useState } from 'react';

import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { layerLookup } from './config/displayDefaults';
import { BASEMAP_STORAGE_KEY, DETAIL_ZOOM, basemapLayers } from './config/mapConfig';
import { loadAppData } from './services/api';
import { featureCenter, siteLabel } from './utils/features';
import { featureMatches, groupFeaturesByLayer } from './utils/search';

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
  const [enabled, setEnabled] = useState({});
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
  const layerConfigByName = useMemo(() => layerLookup(manifest), [manifest]);
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
      latitude: center.latitude,
      longitude: center.longitude,
      label: siteLabel(feature, layerConfigByName[feature.properties.dataset]),
      targetZoom,
    });
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <Sidebar
        basemapId={basemapId}
        directoryLayers={directoryLayers}
        enabled={enabled}
        error={error}
        loading={loading}
        onBasemapChange={setBasemapId}
        onLayerToggle={handleLayerToggle}
        onQueryChange={setQuery}
        onSiteSelect={selectSite}
        onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        query={query}
        selectedSite={selectedSite}
        stats={stats}
        theme={theme}
        visibleCount={visibleCount}
      />
      <MapView
        activeBasemap={activeBasemap}
        error={error}
        loading={loading}
        onSelectSite={selectSite}
        onZoomChange={setZoom}
        query={query}
        selectedSite={selectedSite}
        showDetailShapes={showDetailShapes}
        manifest={manifest}
        visibleLayers={visibleLayers}
      />
    </main>
  );
}
