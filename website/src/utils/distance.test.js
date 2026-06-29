import { describe, expect, it } from 'vitest';

import { distanceMilesBetween, googleMapsDirectionsUrl } from './distance';

describe('distance helpers', () => {
  it('computes approximate distance in miles', () => {
    const miles = distanceMilesBetween(
      { latitude: 40.4237, longitude: -86.9212 },
      { latitude: 39.7684, longitude: -86.1581 }
    );
    expect(miles).toBeGreaterThan(55);
    expect(miles).toBeLessThan(65);
  });

  it('returns null for invalid coordinates', () => {
    expect(distanceMilesBetween({ latitude: 'x', longitude: 0 }, { latitude: 1, longitude: 1 })).toBeNull();
  });

  it('builds a Google Maps directions URL with optional origin', () => {
    const url = googleMapsDirectionsUrl(
      { latitude: 40.45, longitude: -86.94 },
      { latitude: 40.42, longitude: -86.92 }
    );
    expect(url).toContain('https://www.google.com/maps/dir/?');
    expect(url).toContain('destination=40.45%2C-86.94');
    expect(url).toContain('origin=40.42%2C-86.92');
  });
});
