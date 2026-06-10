import { API_BASE } from '../config/mapConfig';

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function loadAppData() {
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
