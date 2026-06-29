const EARTH_RADIUS_MILES = 3958.7613;

function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

export function distanceMilesBetween(a, b) {
  const lat1 = Number(a?.latitude);
  const lon1 = Number(a?.longitude);
  const lat2 = Number(b?.latitude);
  const lon2 = Number(b?.longitude);

  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export function googleMapsDirectionsUrl(destination, origin = null) {
  const destLat = Number(destination?.latitude);
  const destLon = Number(destination?.longitude);
  if (!Number.isFinite(destLat) || !Number.isFinite(destLon)) {
    return '';
  }

  const params = new URLSearchParams({
    api: '1',
    destination: `${destLat},${destLon}`,
  });

  const originLat = Number(origin?.latitude);
  const originLon = Number(origin?.longitude);
  if (Number.isFinite(originLat) && Number.isFinite(originLon)) {
    params.set('origin', `${originLat},${originLon}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
