import { describe, expect, it } from 'vitest';

import { KNOWN_DATASETS } from '../config/schema';
import { normalizeLayer } from './normalizeLayer';

describe('normalizeLayer', () => {
  it('applies the known dataset config and injects map contract fields', async () => {
    const layer = await normalizeLayer(
      {
        rawName: 'All_Candidate_Sites_Final',
        geometryType: 'polygon',
        fields: [{ name: 'Unit_Site', type: 'text' }],
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { Unit_Site: 'A', SPR_ID: 7, Ignored_Col: 'drop me' },
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
      KNOWN_DATASETS[0]
    );
    const props = layer.geojson.features[0].properties;
    expect(layer.name).toBe('all_candidate_sites');
    expect(layer.title).toBe('All Candidate Sites');
    expect(layer.layer_type).toBe('candidate');
    expect(layer.color).toBe('#2563eb');
    expect(layer.bounds).toEqual([0, 0, 1, 1]);
    expect(props.dataset).toBe('all_candidate_sites');
    expect(props.layer_title).toBe('All Candidate Sites');
    expect(props.Unit_Site).toBe('A');
    expect(props.Ignored_Col).toBeUndefined();
    expect(Number.isFinite(props.center_latitude)).toBe(true);
    expect(layer.source_valid_geometries).toBe(1);
  });

  it('requires a known dataset configuration', async () => {
    await expect(
      normalizeLayer({ rawName: 'x', geometryType: 'polygon', fields: [], geojson: { type: 'FeatureCollection', features: [] } })
    ).rejects.toThrow(/known dataset/i);
  });
});
