export const DISPLAY_PALETTE = [
  '#59636f',
  '#0f8b8d',
  '#b45309',
  '#2563eb',
  '#7c3aed',
  '#047857',
  '#be123c',
  '#4338ca',
];

export const LEGACY_SCORE_FIELDS = [
  { field: 'sol_s', label: 'Solar score', type: 'number' },
  { field: 'slp_s', label: 'Slope score', type: 'number' },
  { field: 'trn_s', label: 'Access score', type: 'number' },
  { field: 'evp_s', label: 'Evapotranspiration score', type: 'number' },
  { field: 'dem_s', label: 'Terrain / elevation score', type: 'number' },
  { field: 'fld_s', label: 'Flood score', type: 'number' },
  { field: 'lc_s', label: 'Land-cover score', type: 'number' },
];

export const LEGACY_POPUP_FIELDS = [
  { field: 'SPR_ID', label: 'SPR ID', type: 'text' },
  { field: 'Site_typ', label: 'Type', type: 'text' },
  { field: 'layer', label: 'District', type: 'text' },
  { field: 'Solar_Mean', label: 'Solar mean', type: 'number', precision: 0 },
];

export const LEGACY_LAYER_DEFAULTS = {
  all_candidate_sites: {
    color: '#59636f',
    fillOpacity: 0.22,
    weight: 1,
    label_field: 'Unit_Site',
    subgroup_field: 'layer',
    popup_fields: LEGACY_POPUP_FIELDS,
    score_fields: [],
  },
  facility_scored: {
    color: '#0f8b8d',
    fillOpacity: 0.34,
    weight: 2,
    label_field: 'Unit_Site',
    subgroup_field: 'layer',
    popup_fields: LEGACY_POPUP_FIELDS,
    score_fields: LEGACY_SCORE_FIELDS,
  },
  row_scored: {
    color: '#b45309',
    fillOpacity: 0.34,
    weight: 2,
    label_field: 'Unit_Site',
    subgroup_field: 'layer',
    popup_fields: LEGACY_POPUP_FIELDS,
    score_fields: LEGACY_SCORE_FIELDS,
  },
};

function normalizeFieldList(fields, fallback = []) {
  if (!Array.isArray(fields)) {
    return fallback;
  }
  return fields
    .map((item) => {
      if (typeof item === 'string') {
        return { field: item, label: item.replace(/_/g, ' '), type: 'text' };
      }
      return item?.field ? item : null;
    })
    .filter(Boolean);
}

export function resolveLayerDisplay(layer = {}, index = 0) {
  const legacy = LEGACY_LAYER_DEFAULTS[layer.name] || {};
  return {
    color: layer.color || legacy.color || DISPLAY_PALETTE[index % DISPLAY_PALETTE.length],
    fillOpacity: legacy.fillOpacity ?? 0.34,
    weight: legacy.weight ?? 2,
    label_field: layer.label_field || legacy.label_field || '',
    subgroup_field: layer.subgroup_field || legacy.subgroup_field || '',
    popup_fields: normalizeFieldList(layer.popup_fields, legacy.popup_fields || LEGACY_POPUP_FIELDS),
    score_fields: normalizeFieldList(layer.score_fields, legacy.score_fields || []),
    score_color_field: layer.score_color_field || null,
  };
}

export function resolveLabelField(layer = {}) {
  return layer.label_field || LEGACY_LAYER_DEFAULTS[layer.name]?.label_field || '';
}

export function resolvePopupFields(layer = {}) {
  return normalizeFieldList(layer.popup_fields, LEGACY_LAYER_DEFAULTS[layer.name]?.popup_fields || LEGACY_POPUP_FIELDS);
}

export function layerLookup(manifest) {
  return Object.fromEntries((manifest?.layers || []).map((layer, index) => [layer.name, { ...layer, index }]));
}
