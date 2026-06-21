import { describe, expect, it } from 'vitest';

import { validateProject } from './validate';

describe('validateProject', () => {
  it('reports missing labels, numeric errors, and score warnings', () => {
    const result = validateProject([
      {
        name: 'layer',
        label_field: 'Name',
        popup_fields: [{ field: 'Area', label: 'Area', type: 'number' }],
        score_fields: [{ field: 'score', label: 'Score', type: 'number' }],
        geojson: {
          features: [
            {
              properties: {
                feature_id: 'a',
                Name: '',
                Area: 'not-a-number',
                score: 0,
                center_latitude: 39,
                center_longitude: -86,
              },
            },
          ],
        },
      },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.map((item) => item.field)).toEqual(expect.arrayContaining(['Name', 'Area']));
    expect(result.warnings[0].field).toBe('score');
  });
});
