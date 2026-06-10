import { API_BASE } from '../config/mapConfig';

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function loadAppData() {
  if (API_BASE) {
    const [manifest, stats] = await Promise.all([
      fetchJson('/api/manifest'),
      fetchJson('/api/stats'),
    ]);
    const layerEntries = await Promise.all(
      manifest.layers.map(async (layer) => [layer.name, await fetchJson(`/api/layers/${layer.name}`)])
    );

    return {
      manifest,
      stats,
      layers: Object.fromEntries(layerEntries),
    };
  }

  const dataBase = window.INDOT_DATA_BASE || './data';
  const manifest = await fetchJson(`${dataBase}/manifest.json`);
  const layerEntries = await Promise.all(
    manifest.layers.map(async (layer) => [layer.name, await fetchJson(`${dataBase}/${layer.output || `${layer.name}.geojson`}`)])
  );
  const stats = {
    layer_count: manifest.layers.length,
    feature_count: manifest.feature_count || manifest.layers.reduce((sum, layer) => sum + layer.records, 0),
    fixed_geometries: manifest.layers.reduce((sum, layer) => sum + layer.fixed_geometries, 0),
    layers: manifest.layers,
  };

  return {
    manifest,
    stats,
    layers: Object.fromEntries(layerEntries),
  };
}
