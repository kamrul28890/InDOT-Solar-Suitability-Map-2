import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { createUpdatePackageZip } from './buildPackage';

describe('createUpdatePackageZip', () => {
  it('writes the drop-in data/processed layout', async () => {
    const buffer = await createUpdatePackageZip(
      {
        manifest: { project: { name: 'Test' }, layers: [{ name: 'custom' }] },
        layers: [{ name: 'custom', geojson: { type: 'FeatureCollection', features: [] } }],
      },
      'nodebuffer'
    );
    const zip = await JSZip.loadAsync(buffer);
    expect(zip.file('README.txt')).toBeTruthy();
    expect(zip.file('data/processed/manifest.json')).toBeTruthy();
    expect(zip.file('data/processed/custom.geojson')).toBeTruthy();
  });
});
