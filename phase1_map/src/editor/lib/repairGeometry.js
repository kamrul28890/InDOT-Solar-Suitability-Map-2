import 'jsts/dist/jsts.min.js';
import { cleanCoords, rewind } from '@turf/turf';

function jstsApi() {
  const api = globalThis.jsts;
  if (!api) {
    throw new Error('Geometry validation library did not load.');
  }
  return api;
}

function normalizeGeometry(geometry) {
  const cleaned = cleanCoords({ type: 'Feature', properties: {}, geometry });
  const rewound = rewind(cleaned, { reverse: false });
  return rewound.geometry;
}

function readGeometry(geometry) {
  const { GeoJSONReader } = jstsApi().io;
  return new GeoJSONReader().read(geometry);
}

function writeGeometry(geometry) {
  const { GeoJSONWriter } = jstsApi().io;
  return new GeoJSONWriter().write(geometry);
}

export function isGeometryValid(geometry) {
  if (!geometry) {
    return false;
  }
  const { IsValidOp } = jstsApi().operation.valid;
  return new IsValidOp(readGeometry(geometry)).isValid();
}

async function makeValidWithGeos(geometry) {
  const [{ default: initGeosJs }, helpers] = await Promise.all([import('geos-wasm'), import('geos-wasm/helpers')]);
  const geos = await initGeosJs();
  const geomPtr = helpers.geojsonToGeosGeom(geometry, geos);
  const validPtr = geos.GEOSMakeValid(geomPtr);
  const repaired = helpers.geosGeomToGeojson(validPtr, geos);
  geos.GEOSGeom_destroy(geomPtr);
  geos.GEOSGeom_destroy(validPtr);
  return repaired;
}

export async function repairGeometry(geom) {
  const geometry = normalizeGeometry(geom);
  if (isGeometryValid(geometry)) {
    return { geometry, wasValid: true, method: 'none' };
  }

  const api = jstsApi();
  const geometryFixer = api.geom?.util?.GeometryFixer || api.operation?.valid?.GeometryFixer;
  if (geometryFixer) {
    const fixed = normalizeGeometry(writeGeometry(geometryFixer.fix(readGeometry(geometry))));
    if (isGeometryValid(fixed)) {
      return { geometry: fixed, wasValid: false, method: 'GeometryFixer' };
    }
  }

  if (geometry.type.includes('Polygon')) {
    const buffered = normalizeGeometry(writeGeometry(readGeometry(geometry).buffer(0)));
    if (isGeometryValid(buffered)) {
      return { geometry: buffered, wasValid: false, method: 'buffer0' };
    }
  }

  const geosFixed = normalizeGeometry(await makeValidWithGeos(geometry));
  if (!isGeometryValid(geosFixed)) {
    throw new Error('GEOSMakeValid returned invalid geometry.');
  }
  return { geometry: geosFixed, wasValid: false, method: 'GEOSMakeValid' };
}
