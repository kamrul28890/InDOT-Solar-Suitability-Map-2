import { describe, expect, it } from 'vitest';

import { isGeometryValid, repairGeometry } from './repairGeometry';

const bowtie = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 1],
      [0, 0],
    ],
  ],
};

describe('repairGeometry', () => {
  it('leaves valid geometry unchanged', async () => {
    const valid = {
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
    };
    const result = await repairGeometry(valid);
    expect(result.wasValid).toBe(true);
    expect(result.method).toBe('none');
    expect(isGeometryValid(result.geometry)).toBe(true);
  });

  it('repairs a self-intersecting polygon', async () => {
    expect(isGeometryValid(bowtie)).toBe(false);
    const result = await repairGeometry(bowtie);
    expect(result.wasValid).toBe(false);
    expect(['buffer0', 'GeometryFixer', 'GEOSMakeValid']).toContain(result.method);
    expect(isGeometryValid(result.geometry)).toBe(true);
  });
});
