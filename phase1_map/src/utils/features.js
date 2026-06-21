import { resolveLabelField } from '../config/displayDefaults';

export function featureKey(feature, fallbackIndex = 0, layerConfig = {}) {
  const p = feature.properties;
  return `${p.dataset}:${p.feature_id ?? p.SPR_ID ?? fallbackIndex}:${siteLabel(feature, layerConfig)}`;
}

export function siteLabel(feature, layerConfig = {}) {
  const p = feature.properties;
  const labelField = resolveLabelField(layerConfig);
  if (labelField && p[labelField] !== null && p[labelField] !== undefined && p[labelField] !== '') {
    return String(p[labelField]);
  }
  return p.Unit_Site || `${p.Site_typ || 'Site'} ${p.SPR_ID ?? ''}`.trim() || p.feature_id || 'Unnamed site';
}

export function featureCenter(feature) {
  const latitude = Number(feature.properties.center_latitude);
  const longitude = Number(feature.properties.center_longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
