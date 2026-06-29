import { describe, expect, it } from 'vitest';

import { buildShareLink, parseMapState } from './shareLinks';

describe('shareLinks', () => {
  it('builds hash-router map links with encoded state', () => {
    expect(buildShareLink({ site: 'SPR 1', color: 'sol_s', ignored: 'x' })).toBe('#/map?site=SPR+1&color=sol_s');
  });

  it('parses allowed map state keys', () => {
    expect(parseMapState('#/map?site=SPR+1&color=sol_s&overall=no')).toEqual({
      site: 'SPR 1',
      color: 'sol_s',
    });
  });
});
