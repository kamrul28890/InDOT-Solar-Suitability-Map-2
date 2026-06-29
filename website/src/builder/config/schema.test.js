import { describe, expect, it } from 'vitest';

import { DATASET_ORDER, matchDataset } from './schema';

describe('matchDataset', () => {
  it('matches each known dataset by shapefile stem (case/extension/path insensitive)', () => {
    expect(matchDataset('All_Candidate_Sites_Final.shp')?.name).toBe('all_candidate_sites');
    expect(matchDataset('data/solar_potential_scored_indotfacility')?.name).toBe('facility_scored');
    expect(matchDataset('SOLAR_POTENTIAL_SCORED_INTERCHANGE.SHP')?.name).toBe('row_scored');
  });

  it('returns null for unknown shapefiles', () => {
    expect(matchDataset('some_random_layer.shp')).toBeNull();
    expect(matchDataset('')).toBeNull();
  });

  it('keeps the canonical dataset order', () => {
    expect(DATASET_ORDER).toEqual(['all_candidate_sites', 'facility_scored', 'row_scored']);
  });
});
