import { API_BASE } from '../config/mapConfig';

const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'api';
const STATIC_DATA_BASE = `${import.meta.env.BASE_URL}data/processed`;

async function fetchJson(path) {
  // API mode is used by local/Windows FastAPI deployments.
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchStaticJson(path) {
  // Static mode resolves below Vite's configured base path for GitHub Pages.
  const response = await fetch(`${STATIC_DATA_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function statsFromManifest(manifest) {
  // Static hosting has no /api/stats endpoint, so derive the identical summary.
  const layers = manifest.layers || [];
  return {
    layer_count: layers.length,
    feature_count: layers.reduce((sum, layer) => sum + (layer.records || 0), 0),
    fixed_geometries: layers.reduce((sum, layer) => sum + (layer.fixed_geometries || 0), 0),
    layers,
  };
}

async function loadStaticAppData() {
  // Load all layers in parallel after the manifest identifies their filenames.
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
  // Manifest and aggregate statistics are independent and can load together.
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
  // Present one data shape to React regardless of deployment architecture.
  return DATA_MODE === 'static' ? loadStaticAppData() : loadApiAppData();
}
