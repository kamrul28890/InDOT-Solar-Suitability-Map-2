import { cleanCoords, rewind } from '@turf/turf';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js';
import IsValidOp from 'jsts/org/locationtech/jts/operation/valid/IsValidOp.js';
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';

function normalizeGeometry(geometry) {
  const cleaned = cleanCoords({ type: 'Feature', properties: {}, geometry });
  const rewound = rewind(cleaned, { reverse: false });
  return rewound.geometry;
}

function readGeometry(geometry) {
  return new GeoJSONReader().read(geometry);
}

function writeGeometry(geometry) {
  return new GeoJSONWriter().write(geometry);
}

export function isGeometryValid(geometry) {
  if (!geometry) {
    return false;
  }
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

  if (geometry.type.includes('Polygon')) {
    const buffered = normalizeGeometry(writeGeometry(BufferOp.bufferOp(readGeometry(geometry), 0)));
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
