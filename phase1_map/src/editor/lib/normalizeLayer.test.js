import { describe, expect, it } from 'vitest';

import { normalizeLayer } from './normalizeLayer';

describe('normalizeLayer', () => {
  it('injects map contract fields and computes stats', async () => {
    const layer = await normalizeLayer(
      {
        rawName: 'Custom Layer',
        geometryType: 'polygon',
        fields: [{ name: 'Name', type: 'text' }],
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { Name: 'A' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                  ],
                ],
              },
            },
          ],
        },
      },
      0
    );
    const props = layer.geojson.features[0].properties;
    expect(layer.name).toBe('custom_layer');
    expect(layer.bounds).toEqual([0, 0, 1, 1]);
    expect(props.dataset).toBe('custom_layer');
    expect(props.layer_title).toBe('Custom Layer');
    expect(Number.isFinite(props.center_latitude)).toBe(true);
    expect(layer.source_valid_geometries).toBe(1);
  });
});
