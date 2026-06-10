export function featureKey(feature, fallbackIndex = 0) {
  const p = feature.properties;
  return `${p.dataset}:${p.SPR_ID ?? fallbackIndex}:${p.Unit_Site ?? 'site'}`;
}

export function siteLabel(feature) {
  const p = feature.properties;
  return p.Unit_Site || `${p.Site_typ || 'Site'} ${p.SPR_ID ?? ''}`.trim();
}

export function featureCenter(feature) {
  const latitude = Number(feature.properties.center_latitude);
  const longitude = Number(feature.properties.center_longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
