import { bbox, pointOnFeature } from '@turf/turf';

import { KEEP_FIELDS } from '../config/schema';
import { repairGeometry } from './repairGeometry';

function featureId(datasetName, sourceProps, index) {
  return String(sourceProps?.feature_id || sourceProps?.SPR_ID || `${datasetName}_${index + 1}`);
}

// Columns shown in the Edit table: the known display fields plus score fields.
function editableFields(dataset) {
  const fields = dataset.display_fields.map((name) => ({ name, type: 'text' }));
  for (const score of dataset.score_fields) {
    fields.push({ name: score.field, type: 'number' });
  }
  return fields;
}

// Apply the fixed known-dataset configuration to a parsed shapefile layer.
// Geometry is repaired (guaranteed valid) and the contract fields the viewer
// relies on are injected, mirroring scripts/export_app_data.py output.
export async function normalizeLayer(rawLayer, dataset) {
  if (!dataset) {
    throw new Error('normalizeLayer requires a known dataset configuration.');
  }

  const name = dataset.name;
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

    const sourceProps = feature.properties || {};
    const properties = {};
    for (const key of KEEP_FIELDS) {
      if (key in sourceProps) {
        properties[key] = sourceProps[key];
      }
    }

    const normalizedFeature = { type: 'Feature', geometry: repaired.geometry, properties };
    const center = pointOnFeature(normalizedFeature);
    properties.feature_id = featureId(name, sourceProps, featureIndex);
    properties.dataset = name;
    properties.layer_title = dataset.title;
    properties.layer_type = dataset.layer_type;
    properties.center_longitude = center.geometry.coordinates[0];
    properties.center_latitude = center.geometry.coordinates[1];
    properties.source_geometry_valid = repaired.wasValid;
    normalizedFeatures.push(normalizedFeature);
  }

  const geojson = { type: 'FeatureCollection', features: normalizedFeatures };
  const layerBounds = normalizedFeatures.length ? bbox(geojson).map((value) => Number(value.toFixed(6))) : null;

  return {
    name,
    rawName: rawLayer.rawName,
    title: dataset.title,
    layer_type: dataset.layer_type,
    geometry_type: rawLayer.geometryType,
    color: dataset.color,
    label_field: dataset.label_field,
    subgroup_field: dataset.subgroup_field,
    popup_fields: dataset.popup_fields,
    score_fields: dataset.score_fields,
    score_color_field: null,
    fields: editableFields(dataset),
    bounds: layerBounds,
    source_valid_geometries: validCount,
    fixed_geometries: fixedCount,
    escalated_geometries: escalatedCount,
    geojson,
  };
}
