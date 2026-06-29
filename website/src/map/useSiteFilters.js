import { CRITERIA } from '../config/criteria';
import { flattenFeatures } from '../utils/stats';

export const DEFAULT_FILTERS = {
  criterionRanges: Object.fromEntries(CRITERIA.map((criterion) => [criterion.key, [0, 1]])),
  district: '',
  type: '',
  voltage: '',
  flood: '',
};

export function siteFilterReducer(state, action) {
  switch (action.type) {
    case 'criterionRange':
      return {
        ...state,
        criterionRanges: {
          ...state.criterionRanges,
          [action.key]: action.range,
        },
      };
    case 'field':
      return { ...state, [action.field]: action.value };
    case 'reset':
      return DEFAULT_FILTERS;
    default:
      return state;
  }
}

function matchesRange(value, [min, max]) {
  const number = Number(value);
  return !Number.isFinite(number) || (number >= min && number <= max);
}

export function featurePassesFilters(feature, filters = DEFAULT_FILTERS) {
  const p = feature.properties || {};
  if (filters.district && p.layer !== filters.district) return false;
  if (filters.type && p.Site_typ !== filters.type) return false;
  if (filters.voltage && p.Volt_Class !== filters.voltage) return false;
  if (filters.flood && p.Flood_Zone !== filters.flood) return false;

  return Object.entries(filters.criterionRanges || {}).every(([key, range]) => matchesRange(p[key], range));
}

export function filterLayers(layers, filters = DEFAULT_FILTERS) {
  return Object.fromEntries(
    Object.entries(layers).map(([name, geojson]) => [
      name,
      {
        ...geojson,
        features: (geojson?.features || []).filter((feature) => featurePassesFilters(feature, filters)),
      },
    ])
  );
}

export function filterFeatures(layers, filters = DEFAULT_FILTERS) {
  return flattenFeatures(filterLayers(layers, filters));
}
