import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseShapefiles } from './parseShapefiles';

const fixtureDir = join('..', 'archive', 'phase1_map', 'All_Candidate_Sites');
const fixtureParts = [
  'All_Candidate_Sites_Final.shp',
  'All_Candidate_Sites_Final.dbf',
  'All_Candidate_Sites_Final.shx',
  'All_Candidate_Sites_Final.prj',
];
const describeWithLocalFixtures = fixtureParts.every((part) => existsSync(join(fixtureDir, part)))
  ? describe
  : describe.skip;

async function file(path, name) {
  return new File([await readFile(path)], name);
}

describeWithLocalFixtures('parseShapefiles local fixtures', () => {
  it('loads loose local INDOT shapefile components', async () => {
    const result = await parseShapefiles([
      await file(join(fixtureDir, 'All_Candidate_Sites_Final.shp'), 'All_Candidate_Sites_Final.shp'),
      await file(join(fixtureDir, 'All_Candidate_Sites_Final.dbf'), 'All_Candidate_Sites_Final.dbf'),
      await file(join(fixtureDir, 'All_Candidate_Sites_Final.shx'), 'All_Candidate_Sites_Final.shx'),
      await file(join(fixtureDir, 'All_Candidate_Sites_Final.prj'), 'All_Candidate_Sites_Final.prj'),
    ]);
    expect(result.layers[0].geojson.features).toHaveLength(104);
    expect(result.layers[0].geometryType).toBe('polygon');
    expect(result.layers[0].fields.map((field) => field.name)).toContain('SPR_ID');
  });
});
