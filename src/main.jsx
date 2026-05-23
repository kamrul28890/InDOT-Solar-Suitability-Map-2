import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { Filter, Layers, RefreshCw, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const layerColors = {
  all_candidate_sites: '#59636f',
  facility_scored: '#0f8b8d',
  row_scored: '#b45309',
};

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'n/a';
  }
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function styleFeature(feature) {
  const dataset = feature.properties.dataset;
  const score = Number(feature.properties.score_mean);
  const baseColor = layerColors[dataset] || '#374151';
  return {
    color: baseColor,
    fillColor: baseColor,
    fillOpacity: Number.isFinite(score) ? 0.25 + score * 0.45 : 0.18,
    opacity: 0.9,
    weight: dataset === 'all_candidate_sites' ? 1 : 2,
  };
}

function bindPopup(feature, layer) {
  const p = feature.properties;
  layer.bindPopup(`
    <div class="map-popup">
      <strong>${p.Unit_Site || 'Unnamed site'}</strong>
      <span>SPR ID: ${p.SPR_ID ?? 'n/a'}</span>
      <span>Type: ${p.Site_typ || p.layer_type || 'n/a'}</span>
      <span>District: ${p.layer || 'n/a'}</span>
      <span>Mean score: ${formatNumber(p.score_mean, 3)}</span>
      <span>Solar mean: ${formatNumber(p.Solar_Mean, 0)}</span>
      <span>Center: ${formatNumber(p.center_latitude, 5)}, ${formatNumber(p.center_longitude, 5)}</span>
    </div>
  `);
}

function featureMatches(feature, query, minScore) {
  const p = feature.properties;
  const text = `${p.SPR_ID ?? ''} ${p.Unit_Site ?? ''} ${p.Site_typ ?? ''} ${p.layer ?? ''}`.toLowerCase();
  const matchesQuery = text.includes(query.trim().toLowerCase());
  const score = Number(p.score_mean);
  const matchesScore = !Number.isFinite(score) || score >= minScore;
  return matchesQuery && matchesScore;
}

function App() {
  const [manifest, setManifest] = useState(null);
  const [stats, setStats] = useState(null);
  const [layers, setLayers] = useState({});
  const [enabled, setEnabled] = useState({
    all_candidate_sites: true,
    facility_scored: true,
    row_scored: true,
  });
  const [query, setQuery] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const [manifestData, statsData] = await Promise.all([
          fetchJson('/api/manifest'),
          fetchJson('/api/stats'),
        ]);
        const layerEntries = await Promise.all(
          manifestData.layers.map(async (layer) => [layer.name, await fetchJson(`/api/layers/${layer.name}`)])
        );
        setManifest(manifestData);
        setStats(statsData);
        setLayers(Object.fromEntries(layerEntries));
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
      const filtered = {
        ...geojson,
        features: geojson.features.filter((feature) => featureMatches(feature, query, minScore)),
      };
      return [[name, filtered]];
    });
  }, [enabled, layers, minScore, query]);

  const visibleCount = visibleLayers.reduce((sum, [, layer]) => sum + layer.features.length, 0);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="app-header">
          <span className="eyebrow">SPR 4862</span>
          <h1>INDOT Solar Suitability Map</h1>
        </header>

        <section className="control-group">
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search site, district, SPR ID"
            />
          </label>
        </section>

        <section className="control-group">
          <div className="section-title">
            <Layers size={18} aria-hidden="true" />
            <h2>Layers</h2>
          </div>
          <div className="layer-list">
            {(manifest?.layers || []).map((layer) => (
              <label className="layer-toggle" key={layer.name}>
                <input
                  type="checkbox"
                  checked={enabled[layer.name] ?? false}
                  onChange={(event) => setEnabled((current) => ({ ...current, [layer.name]: event.target.checked }))}
                />
                <span className="swatch" style={{ backgroundColor: layerColors[layer.name] }} />
                <span>{layer.title}</span>
                <small>{layer.records}</small>
              </label>
            ))}
          </div>
        </section>

        <section className="control-group">
          <div className="section-title">
            <Filter size={18} aria-hidden="true" />
            <h2>Score</h2>
          </div>
          <label className="range-row">
            <span>Minimum mean score</span>
            <strong>{minScore.toFixed(2)}</strong>
          </label>
          <input
            className="score-slider"
            min="0"
            max="1"
            step="0.05"
            value={minScore}
            onChange={(event) => setMinScore(Number(event.target.value))}
            type="range"
          />
        </section>

        <section className="stats-grid">
          <div>
            <span>Visible</span>
            <strong>{visibleCount}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{stats?.feature_count ?? 0}</strong>
          </div>
          <div>
            <span>Fixed Geometry</span>
            <strong>{stats?.fixed_geometries ?? 0}</strong>
          </div>
          <div>
            <span>Layers</span>
            <strong>{stats?.layer_count ?? 0}</strong>
          </div>
        </section>

        <button
          className="icon-button"
          onClick={() => window.location.reload()}
          type="button"
          title="Reload data"
        >
          <RefreshCw size={18} aria-hidden="true" />
          Reload data
        </button>

        {error ? <p className="error-message">API error: {error}</p> : null}
      </aside>

      <section className="map-stage" aria-label="Interactive Indiana solar suitability map">
        <MapContainer center={[39.9, -86.2]} zoom={7} minZoom={6} className="map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visibleLayers.map(([name, geojson]) => (
            <GeoJSON key={`${name}-${query}-${minScore}-${geojson.features.length}`} data={geojson} style={styleFeature} onEachFeature={bindPopup} />
          ))}
        </MapContainer>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
