import shp from 'shpjs';

// Geometry, attributes, and projection are mandatory. SHX and CPG are accepted
// when supplied but shpjs can parse the browser upload without requiring them.
const REQUIRED_EXTENSIONS = new Set(['shp', 'dbf', 'prj']);

function extension(file) {
  // File objects can originate from a ZIP picker or drag/drop directory entry.
  return file.name.split('.').pop().toLowerCase();
}

function basename(file) {
  return file.name.replace(/\.[^.]+$/, '').split(/[\\/]/).pop();
}

async function fileToBuffer(file) {
  return file.arrayBuffer();
}

function inferFieldType(values) {
  // Sample-based inference is used only to choose editor controls/validation;
  // original values remain unchanged until the normalization stage.
  const present = values.filter((value) => value !== null && value !== undefined && value !== '');
  if (!present.length) {
    return 'text';
  }
  return present.every((value) => Number.isFinite(Number(value))) ? 'number' : 'text';
}

function fieldsFromGeojson(geojson) {
  // Union property names across features because DBF records may be sparse.
  const names = Array.from(
    geojson.features.reduce((set, feature) => {
      Object.keys(feature.properties || {}).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
  return names.map((name) => ({
    name,
    type: inferFieldType(geojson.features.slice(0, 50).map((feature) => feature.properties?.[name])),
  }));
}

function geometryTypeFromGeojson(geojson) {
  // Project datasets are homogeneous; the first non-null geometry is enough for
  // display metadata while full geometry validation occurs later.
  const first = geojson.features.find((feature) => feature.geometry)?.geometry?.type || 'Geometry';
  if (first.includes('Point')) return 'point';
  if (first.includes('Line')) return 'line';
  return 'polygon';
}

function asLayer(rawName, geojson) {
  return {
    rawName,
    geojson,
    geometryType: geometryTypeFromGeojson(geojson),
    fields: fieldsFromGeojson(geojson),
  };
}

function normalizeShpResult(result, fallbackName) {
  // shpjs returns either one FeatureCollection or an array for multi-layer ZIPs.
  if (Array.isArray(result)) {
    return result.map((layer) => asLayer(layer.fileName || layer.name || fallbackName, layer));
  }
  return [asLayer(result.fileName || fallbackName, result)];
}

export async function parseShapefiles(files) {
  // Support both complete ZIP archives and loose sidecar sets without uploading
  // project data to a server.
  const list = Array.from(files || []);
  if (!list.length) {
    throw new Error('Drop shapefile components or a shapefile ZIP.');
  }

  const zips = list.filter((file) => extension(file) === 'zip');
  if (zips.length) {
    const layers = [];
    for (const zipFile of zips) {
      layers.push(...normalizeShpResult(await shp(await fileToBuffer(zipFile)), basename(zipFile)));
    }
    return { layers };
  }

  const grouped = list.reduce((map, file) => {
    // Loose components are grouped by stem before required-part validation.
    const stem = basename(file);
    const ext = extension(file);
    if (!map.has(stem)) {
      map.set(stem, {});
    }
    map.get(stem)[ext] = file;
    return map;
  }, new Map());

  const layers = [];
  for (const [stem, parts] of grouped.entries()) {
    const missing = Array.from(REQUIRED_EXTENSIONS).filter((ext) => !parts[ext]);
    if (missing.length) {
      throw new Error(`${stem} is missing required component(s): ${missing.join(', ')}`);
    }
    const buffers = {};
    for (const [ext, file] of Object.entries(parts)) {
      // shpjs accepts an extension-keyed ArrayBuffer object for loose files.
      buffers[ext] = await fileToBuffer(file);
    }
    layers.push(...normalizeShpResult(await shp(buffers), stem));
  }

  return { layers };
}
