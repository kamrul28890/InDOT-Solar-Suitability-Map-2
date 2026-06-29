import { resolveLayerDisplay } from '../config/displayDefaults';
import { siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';
import { scoreToColor } from '../utils/colorScale';

export function styleFeature(feature, layerConfig = {}, activeCriterion = null) {
  // Resolve manifest-driven display values with legacy fallbacks so old exports
  // and current packages render consistently.
  const display = resolveLayerDisplay(layerConfig, layerConfig.index || 0);
  const dataset = feature.properties.dataset;
  const baseColor = display.color || '#374151';
  const score = activeCriterion ? Number(feature.properties?.[activeCriterion]) : null;
  const hasScore = activeCriterion && Number.isFinite(score);
  const fillColor = hasScore ? scoreToColor(score) : baseColor;
  return {
    color: hasScore ? fillColor : baseColor,
    fillColor,
    fillOpacity: hasScore ? 0.7 : display.fillOpacity ?? (dataset === 'all_candidate_sites' ? 0.22 : 0.34),
    opacity: 0.9,
    weight: display.weight ?? (dataset === 'all_candidate_sites' ? 1 : 2),
  };
}

export function markerStyle(isSelected = false, score = null) {
  // Overview markers use one shared blue style; size/outline carry selection.
  const fillColor = Number.isFinite(Number(score)) ? scoreToColor(score) : '#2563eb';
  return {
    color: '#ffffff',
    fillColor,
    fillOpacity: isSelected ? 0.95 : 0.86,
    opacity: 1,
    radius: isSelected ? 9 : 7,
    weight: isSelected ? 3 : 2,
  };
}

function formatPopupValue(value, field) {
  // Field metadata controls number precision without hard-coding every column.
  if (field.type === 'number') {
    return formatNumber(value, field.precision ?? 3);
  }
  return value ?? 'n/a';
}

export function bindPopup(feature, layer, layerConfig = {}) {
  // Build popup sections from manifest metadata rather than exposing arbitrary
  // GeoJSON properties. Component scores remain a distinct review block.
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
