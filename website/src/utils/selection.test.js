import { describe, expect, it } from 'vitest';

import { findScoredFeatureForSelection, featureHasCriterionScores } from './selection';

const criteria = [{ key: 'sol_s' }, { key: 'slp_s' }];

describe('selection helpers', () => {
  it('detects features with normalized criterion scores', () => {
    expect(featureHasCriterionScores({ properties: { sol_s: 0.4 } }, criteria)).toBe(true);
    expect(featureHasCriterionScores({ properties: { Solar_Mean: 1000 } }, criteria)).toBe(false);
  });

  it('prefers a scored duplicate with the same SPR ID', () => {
    const candidate = { properties: { SPR_ID: 407, dataset: 'all_candidate_sites' } };
    const scored = { properties: { SPR_ID: 407, dataset: 'facility_scored', sol_s: 0.55 } };
    const other = { properties: { SPR_ID: 408, dataset: 'facility_scored', sol_s: 0.7 } };

    expect(
      findScoredFeatureForSelection(
        candidate,
        [
          ['all_candidate_sites', { features: [candidate] }],
          ['facility_scored', { features: [other, scored] }],
        ],
        criteria
      )
    ).toBe(scored);
  });

  it('keeps an unscored feature when no scored duplicate is visible', () => {
    const candidate = { properties: { SPR_ID: 407, dataset: 'all_candidate_sites' } };
    expect(findScoredFeatureForSelection(candidate, [['all_candidate_sites', { features: [candidate] }]], criteria)).toBe(candidate);
  });
});
