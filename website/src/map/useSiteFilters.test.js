import { describe, expect, it } from 'vitest';

import { fixtureLayers } from '../utils/testFixtures';
import { DEFAULT_FILTERS, featurePassesFilters, filterFeatures, filterLayers, siteFilterReducer } from './useSiteFilters';

describe('site filter reducer and selectors', () => {
  it('updates criterion ranges and field filters', () => {
    const ranged = siteFilterReducer(DEFAULT_FILTERS, { type: 'criterionRange', key: 'sol_s', range: [0.5, 1] });
    expect(ranged.criterionRanges.sol_s).toEqual([0.5, 1]);

    const district = siteFilterReducer(ranged, { type: 'field', field: 'district', value: 'Crawfordsville' });
    expect(district.district).toBe('Crawfordsville');
    expect(siteFilterReducer(district, { type: 'reset' })).toBe(DEFAULT_FILTERS);
  });

  it('filters by metadata fields and score ranges without excluding unscored candidates by default', () => {
    expect(filterFeatures(fixtureLayers, DEFAULT_FILTERS)).toHaveLength(6);

    const filters = {
      ...DEFAULT_FILTERS,
      district: 'Crawfordsville',
      criterionRanges: { ...DEFAULT_FILTERS.criterionRanges, sol_s: [0.75, 1] },
    };
    const filtered = filterFeatures(fixtureLayers, filters);
    expect(filtered.map((feature) => feature.properties.SPR_ID)).toEqual(['C-1', 'F-1', 'R-1']);
    expect(featurePassesFilters(fixtureLayers.facility_scored.features[1], filters)).toBe(false);
  });

  it('returns filtered layer collections with stable layer keys', () => {
    const layers = filterLayers(fixtureLayers, { ...DEFAULT_FILTERS, type: 'ROW' });
    expect(Object.keys(layers)).toEqual(Object.keys(fixtureLayers));
    expect(layers.row_scored.features).toHaveLength(2);
    expect(layers.facility_scored.features).toHaveLength(0);
  });
});
