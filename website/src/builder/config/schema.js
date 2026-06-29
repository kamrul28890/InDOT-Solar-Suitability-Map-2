// Fixed INDOT schema for the Map Builder. The browser builder accepts only the
// three known project datasets and applies this fixed display/field
// configuration, so it never asks the maintainer to map arbitrary parameters.
// Mirrors the field configuration in config/field_mapping.json so the exported
// package matches what scripts/export_app_data.py produces.

import { LEGACY_POPUP_FIELDS, LEGACY_SCORE_FIELDS } from '../../config/displayDefaults';

export const DISPLAY_FIELDS = [
  'SPR_ID',
  'Site_typ',
  'Unit_Site',
  'layer',
  'Volt_Class',
  'Flood_Zone',
  'SlopeMean',
  'Solar_Mean',
  'NTran_DIST',
  'Shape_Area',
];

export const SCORE_FIELD_NAMES = ['sol_s', 'slp_s', 'trn_s', 'evp_s', 'dem_s', 'fld_s', 'lc_s'];

export const LAND_COVER_FIELDS = [
  'DevOpe_21',
  'DevLowI_22',
  'DDevMed_23',
  'DDevHig_24',
  'DecFor_41',
  'GrasHe_71',
  'OpenW_11',
  'EverFor_42',
  'MixFor_43',
  'SShrub_52',
  'PasHay_81',
  'CultCr_82',
  'welan_90',
  'EmerW_95',
  'Barre_31',
];

export const PROVENANCE_FIELDS = ['source_geometry_valid'];

// Source columns retained in the exported GeoJSON (everything else is dropped),
// matching normalize_properties() in scripts/export_app_data.py.
export const KEEP_FIELDS = [
  ...DISPLAY_FIELDS,
  ...SCORE_FIELD_NAMES,
  ...LAND_COVER_FIELDS,
  ...PROVENANCE_FIELDS,
];

const SHARED = {
  label_field: 'Unit_Site',
  subgroup_field: 'layer',
  popup_fields: LEGACY_POPUP_FIELDS,
  display_fields: DISPLAY_FIELDS,
};

// Canonical order â€” the manifest and map layering follow this sequence.
export const KNOWN_DATASETS = [
  {
    name: 'all_candidate_sites',
    stems: ['all_candidate_sites_final'],
    title: 'All Candidate Sites',
    layer_type: 'candidate',
    color: '#2563eb',
    score_fields: [],
    ...SHARED,
  },
  {
    name: 'facility_scored',
    stems: ['solar_potential_scored_indotfacility'],
    title: 'Scored INDOT Facilities',
    layer_type: 'facility',
    color: '#1d4ed8',
    score_fields: LEGACY_SCORE_FIELDS,
    ...SHARED,
  },
  {
    name: 'row_scored',
    stems: ['solar_potential_scored_interchange'],
    title: 'Scored Right-of-Way Parcels',
    layer_type: 'row',
    color: '#60a5fa',
    score_fields: LEGACY_SCORE_FIELDS,
    ...SHARED,
  },
];

export const DATASET_ORDER = KNOWN_DATASETS.map((dataset) => dataset.name);

export const EXPECTED_FILE_HINT = KNOWN_DATASETS.map((dataset) => `${dataset.stems[0]}.shp`).join(', ');

function stemOf(rawName) {
  return String(rawName || '')
    .split(/[\\/]/)
    .pop()
    .replace(/\.[^.]+$/, '')
    .trim()
    .toLowerCase();
}

// Map an uploaded shapefile (by stem name) to its known dataset, or null.
export function matchDataset(rawName) {
  const stem = stemOf(rawName);
  if (!stem) {
    return null;
  }
  return (
    KNOWN_DATASETS.find((dataset) => dataset.stems.includes(stem)) ||
    KNOWN_DATASETS.find((dataset) => dataset.stems.some((known) => stem.includes(known) || known.includes(stem))) ||
    null
  );
}


