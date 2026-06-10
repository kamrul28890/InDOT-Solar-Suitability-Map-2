import { layerColors, scoreFields } from '../config/mapConfig';
import { formatNumber } from '../utils/format';

export function styleFeature(feature) {
  const dataset = feature.properties.dataset;
  const baseColor = layerColors[dataset] || '#374151';
  return {
    color: baseColor,
    fillColor: baseColor,
    fillOpacity: dataset === 'all_candidate_sites' ? 0.22 : 0.34,
    opacity: 0.9,
    weight: dataset === 'all_candidate_sites' ? 1 : 2,
  };
}

export function markerStyle(isSelected = false) {
  return {
    color: '#ffffff',
    fillColor: '#2563eb',
    fillOpacity: isSelected ? 0.95 : 0.86,
    opacity: 1,
    radius: isSelected ? 9 : 7,
    weight: isSelected ? 3 : 2,
  };
}

export function bindPopup(feature, layer) {
  const p = feature.properties;
  const scoreRows = scoreFields
    .filter(([field]) => p[field] !== null && p[field] !== undefined)
    .map(([field, label]) => `<span>${label}: ${formatNumber(p[field], 3)}</span>`)
    .join('');

  layer.bindPopup(`
    <div class="map-popup">
      <strong>${p.Unit_Site || 'Unnamed site'}</strong>
      <span>SPR ID: ${p.SPR_ID ?? 'n/a'}</span>
      <span>Type: ${p.Site_typ || p.layer_type || 'n/a'}</span>
      <span>District: ${p.layer || 'n/a'}</span>
      <div class="score-breakdown">
        <strong>Component scores</strong>
        ${scoreRows || '<span>n/a</span>'}
      </div>
      <span>Solar mean: ${formatNumber(p.Solar_Mean, 0)}</span>
      <span>Center: ${formatNumber(p.center_latitude, 5)}, ${formatNumber(p.center_longitude, 5)}</span>
    </div>
  `);
}
