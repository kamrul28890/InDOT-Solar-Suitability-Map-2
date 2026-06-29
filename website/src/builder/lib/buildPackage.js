import JSZip from 'jszip';

export async function createUpdatePackageZip({ manifest, layers }, type = 'blob') {
  // Match the repository's processed-data directory exactly so maintainers can
  // extract or copy the package without renaming files.
  const zip = new JSZip();
  zip.file('README.txt', packageReadme());
  zip.file('data/processed/manifest.json', JSON.stringify(manifest, null, 2));
  for (const layer of layers) {
    // Use normalized layer names rather than uploaded source filenames.
    zip.file(`data/processed/${layer.name}.geojson`, JSON.stringify(layer.geojson));
  }
  return zip.generateAsync({ type });
}

export async function buildUpdatePackage({ manifest, layers }) {
  // Trigger a browser download while releasing the temporary object URL after
  // the synthetic link has been activated.
  const blob = await createUpdatePackageZip({ manifest, layers });
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `INDOT_Map_Update_${timestamp}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function packageReadme() {
  // Keep operational instructions inside every generated update artifact.
  return [
    'INDOT map data update package',
    '',
    'Copy the files under data/processed/ into website/data/processed/ in the source repository.',
    'Commit the changed manifest.json and GeoJSON files to main to trigger the public website deployment.',
    '',
  ].join('\n');
}

