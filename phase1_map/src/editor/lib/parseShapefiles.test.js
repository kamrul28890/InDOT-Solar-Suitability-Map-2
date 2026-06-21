import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { parseShapefiles } from './parseShapefiles';

async function file(path, name) {
  return new File([await readFile(path)], name);
}

describe('parseShapefiles', () => {
  it('loads loose local INDOT shapefile components', async () => {
    const result = await parseShapefiles([
      await file('All_Candidate_Sites/All_Candidate_Sites_Final.shp', 'All_Candidate_Sites_Final.shp'),
      await file('All_Candidate_Sites/All_Candidate_Sites_Final.dbf', 'All_Candidate_Sites_Final.dbf'),
      await file('All_Candidate_Sites/All_Candidate_Sites_Final.shx', 'All_Candidate_Sites_Final.shx'),
      await file('All_Candidate_Sites/All_Candidate_Sites_Final.prj', 'All_Candidate_Sites_Final.prj'),
    ]);
    expect(result.layers[0].geojson.features).toHaveLength(104);
    expect(result.layers[0].geometryType).toBe('polygon');
    expect(result.layers[0].fields.map((field) => field.name)).toContain('SPR_ID');
  });
});
