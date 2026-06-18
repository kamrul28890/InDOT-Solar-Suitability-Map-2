import { API_BASE } from '../config/mapConfig';

const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'api';
const STATIC_DATA_BASE = `${import.meta.env.BASE_URL}data/processed`;

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchStaticJson(path) {
  const response = await fetch(`${STATIC_DATA_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function statsFromManifest(manifest) {
  const layers = manifest.layers || [];
  return {
    layer_count: layers.length,
    feature_count: layers.reduce((sum, layer) => sum + (layer.records || 0), 0),
    fixed_geometries: layers.reduce((sum, layer) => sum + (layer.fixed_geometries || 0), 0),
    layers,
  };
}

async function loadStaticAppData() {
  const manifest = await fetchStaticJson('manifest.json');
  const layerEntries = await Promise.all(
    manifest.layers.map(async (layer) => [layer.name, await fetchStaticJson(`${layer.name}.geojson`)])
  );

  return {
    manifest,
    stats: statsFromManifest(manifest),
    layers: Object.fromEntries(layerEntries),
  };
}

async function loadApiAppData() {
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

export async function loadAppData() {
  return DATA_MODE === 'static' ? loadStaticAppData() : loadApiAppData();
}
