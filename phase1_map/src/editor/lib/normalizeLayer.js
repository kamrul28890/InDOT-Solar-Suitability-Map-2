import { bbox, pointOnFeature } from '@turf/turf';

import { DISPLAY_PALETTE, LEGACY_SCORE_FIELDS } from '../../config/displayDefaults';
import { repairGeometry } from './repairGeometry';

export function slugifyLayerName(value) {
  return String(value || 'layer')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'layer';
}

function guessLabelField(fields) {
  return ['Unit_Site', 'name', 'Name', 'Site_typ', 'SPR_ID'].find((field) => fields.some((item) => item.name === field)) || fields[0]?.name || '';
}

function popupFields(fields) {
  return fields.slice(0, 10).map((field) => ({ field: field.name, label: field.name.replace(/_/g, ' '), type: field.type }));
}

function scoreFields(fields) {
  const known = new Map(LEGACY_SCORE_FIELDS.map((field) => [field.field, field.label]));
  return fields
    .filter((field) => field.type === 'number' && (known.has(field.name) || /score|_s$/i.test(field.name)))
    .map((field) => ({ field: field.name, label: known.get(field.name) || field.name.replace(/_/g, ' '), type: 'number' }));
}

function featureId(layerName, feature, index) {
  return String(feature.properties?.feature_id || feature.properties?.SPR_ID || `${layerName}_${index + 1}`);
}

export async function normalizeLayer(rawLayer, index = 0) {
  const name = slugifyLayerName(rawLayer.rawName);
  let validCount = 0;
  let fixedCount = 0;
  let escalatedCount = 0;
  const normalizedFeatures = [];

  for (const [featureIndex, feature] of rawLayer.geojson.features.entries()) {
    const repaired = await repairGeometry(feature.geometry);
    if (repaired.wasValid) {
      validCount += 1;
    } else {
      fixedCount += 1;
      if (repaired.method === 'GEOSMakeValid') {
        escalatedCount += 1;
      }
    }
    const normalizedFeature = {
      type: 'Feature',
      geometry: repaired.geometry,
      properties: { ...(feature.properties || {}) },
    };
    const center = pointOnFeature(normalizedFeature);
    normalizedFeature.properties.feature_id = featureId(name, normalizedFeature, featureIndex);
    normalizedFeature.properties.dataset = name;
    normalizedFeature.properties.layer_title = rawLayer.rawName;
    normalizedFeature.properties.layer_type = rawLayer.geometryType;
    normalizedFeature.properties.center_longitude = center.geometry.coordinates[0];
    normalizedFeature.properties.center_latitude = center.geometry.coordinates[1];
    normalizedFeature.properties.source_geometry_valid = repaired.wasValid;
    normalizedFeatures.push(normalizedFeature);
  }

  const geojson = { type: 'FeatureCollection', features: normalizedFeatures };
  const layerBounds = normalizedFeatures.length ? bbox(geojson).map((value) => Number(value.toFixed(6))) : null;
  const labelField = guessLabelField(rawLayer.fields);

  return {
    name,
    rawName: rawLayer.rawName,
    title: rawLayer.rawName.replace(/[_-]/g, ' '),
    layer_type: rawLayer.geometryType,
    geometry_type: rawLayer.geometryType,
    color: DISPLAY_PALETTE[index % DISPLAY_PALETTE.length],
    label_field: labelField,
    subgroup_field: rawLayer.fields.some((field) => field.name === 'layer') ? 'layer' : '',
    popup_fields: popupFields(rawLayer.fields),
    score_fields: scoreFields(rawLayer.fields),
    score_color_field: null,
    fields: rawLayer.fields,
    bounds: layerBounds,
    source_valid_geometries: validCount,
    fixed_geometries: fixedCount,
    escalated_geometries: escalatedCount,
    geojson,
  };
}
