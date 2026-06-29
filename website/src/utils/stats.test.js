import { describe, expect, it } from 'vitest';

import { CRITERIA } from '../config/criteria';
import {
  areaHistogram,
  avgScoreByCriterion,
  byCategory,
  criterionScatter,
  distinctValues,
  districtCriterionMatrix,
  flattenFeatures,
  landCoverComposition,
  projectKpis,
  sitesByDistrict,
  sitesByLayer,
  sitesByType,
  sumSiteAcres,
} from './stats';
import { fixtureLayers } from './testFixtures';

describe('stats selectors', () => {
  it('flattens features and preserves dataset names', () => {
    const features = flattenFeatures(fixtureLayers);
    expect(features).toHaveLength(6);
    expect(features.map((feature) => feature.properties.dataset)).toContain('row_scored');
  });

  it('derives project kpis from live layers', () => {
    expect(projectKpis(fixtureLayers)).toMatchObject({
      totalSites: 6,
      districts: 3,
      siteTypes: 3,
    });
    expect(projectKpis(fixtureLayers).totalAcres).toBeCloseTo(21, 5);
    expect(sumSiteAcres(fixtureLayers)).toBeCloseTo(21, 5);
  });

  it('groups sites by district, layer, type, and category fields', () => {
    expect(sitesByDistrict(fixtureLayers)[0]).toEqual({ district: 'Crawfordsville', count: 3 });
    expect(sitesByLayer(fixtureLayers)).toEqual([
      { layer: 'all_candidate_sites', count: 2 },
      { layer: 'facility_scored', count: 2 },
      { layer: 'row_scored', count: 2 },
    ]);
    expect(sitesByType(fixtureLayers).find((row) => row.type === 'Facility').count).toBe(3);
    expect(byCategory(fixtureLayers, 'Flood_Zone').find((row) => row.value === 'X').count).toBe(4);
    expect(distinctValues(fixtureLayers, 'layer')).toEqual(['Crawfordsville', 'Greenfield', 'LaPorte']);
  });

  it('calculates average score by criterion over scored features only', () => {
    const averages = avgScoreByCriterion(fixtureLayers, CRITERIA);
    expect(averages.find((row) => row.key === 'sol_s')).toMatchObject({ n: 4 });
    expect(averages.find((row) => row.key === 'sol_s').mean).toBeCloseTo(0.55, 5);
  });

  it('builds district by criterion matrix with null cells for unscored districts', () => {
    const matrix = districtCriterionMatrix(fixtureLayers, CRITERIA);
    expect(matrix.cells.Crawfordsville.sol_s.mean).toBeCloseTo(0.85, 5);
    expect(matrix.cells.Greenfield.sol_s.mean).toBeCloseTo(0.4, 5);
  });

  it('builds criterion scatter data from scored features', () => {
    const points = criterionScatter(fixtureLayers, 'slp_s', 'sol_s');
    expect(points).toHaveLength(4);
    expect(points[0]).toMatchObject({ id: 'F-1', x: 0.6, y: 0.8, area: 3 });
  });

  it('builds land-cover composition and area histograms', () => {
    const composition = landCoverComposition(fixtureLayers);
    expect(composition.find((row) => row.group === 'overall').segments).toHaveLength(6);
    expect(composition.find((row) => row.group === 'overall').segments.find((segment) => segment.bucket === 'Developed').pct).toBeCloseTo(
      15,
      5
    );

    const histogram = areaHistogram(fixtureLayers, 3);
    expect(histogram).toHaveLength(3);
    expect(histogram.reduce((sum, bin) => sum + bin.count, 0)).toBe(6);
  });

  it('updates outputs when layer data changes', () => {
    const modified = structuredClone(fixtureLayers);
    modified.row_scored.features.push({
      type: 'Feature',
      properties: {
        SPR_ID: 'R-3',
        Unit_Site: 'ROW 3',
        Site_typ: 'ROW',
        layer: 'Fort Wayne',
        Shape_Area: 4046.8564,
        sol_s: 1,
      },
      geometry: null,
    });

    expect(projectKpis(modified).totalSites).toBe(projectKpis(fixtureLayers).totalSites + 1);
    expect(avgScoreByCriterion(modified, CRITERIA).find((row) => row.key === 'sol_s').mean).not.toBe(
      avgScoreByCriterion(fixtureLayers, CRITERIA).find((row) => row.key === 'sol_s').mean
    );
  });
});
