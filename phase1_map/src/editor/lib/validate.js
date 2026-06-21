export function validateProject(layers) {
  const byLayer = {};
  const errors = [];
  const warnings = [];

  for (const layer of layers) {
    const layerErrors = [];
    const layerWarnings = [];
    for (const feature of layer.geojson.features) {
      const props = feature.properties || {};
      const featureId = props.feature_id;
      if (layer.label_field && (props[layer.label_field] === null || props[layer.label_field] === undefined || props[layer.label_field] === '')) {
        layerErrors.push(issue(layer, featureId, layer.label_field, `${layer.label_field} is required.`, 'error'));
      }
      if (!Number.isFinite(Number(props.center_latitude)) || !Number.isFinite(Number(props.center_longitude))) {
        layerErrors.push(issue(layer, featureId, 'center', 'A map center could not be derived.', 'error'));
      }
      for (const field of [...layer.popup_fields, ...layer.score_fields]) {
        const value = props[field.field];
        if (value === null || value === undefined || value === '') {
          continue;
        }
        if (field.type === 'number' && !Number.isFinite(Number(value))) {
          layerErrors.push(issue(layer, featureId, field.field, `${field.label || field.field} must be numeric.`, 'error'));
        }
      }
      for (const field of layer.score_fields) {
        const value = props[field.field];
        if (value === null || value === undefined || value === '') {
          continue;
        }
        const number = Number(value);
        if (!Number.isFinite(number)) {
          layerErrors.push(issue(layer, featureId, field.field, `${field.label || field.field} must be numeric.`, 'error'));
        } else if (number < 0 || number > 1) {
          layerErrors.push(issue(layer, featureId, field.field, `${field.label || field.field} must be between 0 and 1.`, 'error'));
        } else if (number === 0) {
          layerWarnings.push(issue(layer, featureId, field.field, `${field.label || field.field} is exactly 0.0; verify this is intentional.`, 'warning'));
        }
      }
    }
    byLayer[layer.name] = { errors: layerErrors, warnings: layerWarnings };
    errors.push(...layerErrors);
    warnings.push(...layerWarnings);
  }

  return { valid: errors.length === 0, byLayer, errors, warnings };
}

function issue(layer, featureId, field, message, severity) {
  return { layer: layer.name, feature_id: featureId, field, message, severity };
}
