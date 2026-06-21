import { resolveLayerDisplay } from '../config/displayDefaults';
import { siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';

export function styleFeature(feature, layerConfig = {}) {
  const display = resolveLayerDisplay(layerConfig, layerConfig.index || 0);
  const dataset = feature.properties.dataset;
  const baseColor = display.color || '#374151';
  return {
    color: baseColor,
    fillColor: baseColor,
    fillOpacity: display.fillOpacity ?? (dataset === 'all_candidate_sites' ? 0.22 : 0.34),
    opacity: 0.9,
    weight: display.weight ?? (dataset === 'all_candidate_sites' ? 1 : 2),
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

function formatPopupValue(value, field) {
  if (field.type === 'number') {
    return formatNumber(value, field.precision ?? 3);
  }
  return value ?? 'n/a';
}

export function bindPopup(feature, layer, layerConfig = {}) {
  const p = feature.properties;
  const display = resolveLayerDisplay(layerConfig, layerConfig.index || 0);
  const afterScoreFields = new Set(['Solar_Mean']);
  const popupRows = display.popup_fields
    .filter(({ field }) => !afterScoreFields.has(field))
    .filter(({ field }) => p[field] !== null && p[field] !== undefined)
    .map((field) => `<span>${field.label}: ${formatPopupValue(p[field.field], field)}</span>`)
    .join('');
  const afterScoreRows = display.popup_fields
    .filter(({ field }) => afterScoreFields.has(field))
    .filter(({ field }) => p[field] !== null && p[field] !== undefined)
    .map((field) => `<span>${field.label}: ${formatPopupValue(p[field.field], field)}</span>`)
    .join('');
  const scoreRows = display.score_fields
    .filter(({ field }) => p[field] !== null && p[field] !== undefined)
    .map(({ field, label }) => `<span>${label}: ${formatNumber(p[field], 3)}</span>`)
    .join('');

  layer.bindPopup(`
    <div class="map-popup">
      <strong>${siteLabel(feature, layerConfig)}</strong>
      ${popupRows}
      <div class="score-breakdown">
        <strong>Component scores</strong>
        ${scoreRows || '<span>n/a</span>'}
      </div>
      ${afterScoreRows}
      <span>Center: ${formatNumber(p.center_latitude, 5)}, ${formatNumber(p.center_longitude, 5)}</span>
    </div>
  `);
}
