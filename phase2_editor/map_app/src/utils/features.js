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

function collectCoordinatePairs(coordinates, pairs = []) {
  if (!Array.isArray(coordinates)) {
    return pairs;
  }
  if (coordinates.length >= 2 && Number.isFinite(Number(coordinates[0])) && Number.isFinite(Number(coordinates[1]))) {
    pairs.push([Number(coordinates[1]), Number(coordinates[0])]);
    return pairs;
  }
  coordinates.forEach((item) => collectCoordinatePairs(item, pairs));
  return pairs;
}

export function featureBounds(feature) {
  const pairs = collectCoordinatePairs(feature.geometry?.coordinates);
  if (!pairs.length) {
    const center = featureCenter(feature);
    return center ? [[center.latitude, center.longitude], [center.latitude, center.longitude]] : null;
  }

  const latitudes = pairs.map(([latitude]) => latitude);
  const longitudes = pairs.map(([, longitude]) => longitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}
