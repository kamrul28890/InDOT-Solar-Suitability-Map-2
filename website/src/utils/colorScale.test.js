import { describe, expect, it } from 'vitest';

import { MISSING_SCORE_COLOR, SCORE_SCALE, scoreToColor } from './colorScale';

describe('scoreToColor', () => {
  it('returns endpoint colors for exact bounds', () => {
    expect(scoreToColor(0)).toBe(SCORE_SCALE[0]);
    expect(scoreToColor(1)).toBe(SCORE_SCALE[SCORE_SCALE.length - 1]);
  });

  it('interpolates and clamps values', () => {
    expect(scoreToColor(0.5)).toMatch(/^#[0-9A-F]{6}$/);
    expect(scoreToColor(-1)).toBe(SCORE_SCALE[0]);
    expect(scoreToColor(2)).toBe(SCORE_SCALE[SCORE_SCALE.length - 1]);
  });

  it('uses a muted color for missing scores', () => {
    expect(scoreToColor(null)).toBe(MISSING_SCORE_COLOR);
    expect(scoreToColor('not-a-number')).toBe(MISSING_SCORE_COLOR);
  });
});
