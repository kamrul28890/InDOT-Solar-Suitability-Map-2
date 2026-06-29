import { layerLookup, resolveLayerDisplay } from '../config/displayDefaults';
import { featureKey, siteLabel } from './features';

function normalizeSearchText(value) {
  // Accent-insensitive lowercasing makes identifiers and place names searchable
  // without requiring exact Unicode input.
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function compactSearchText(value) {
  // Compact matching treats punctuation and spacing in IDs as optional.
  return normalizeSearchText(value).replace(/[^a-z0-9]/g, '');
}

function searchBlob(feature) {
  // Include property names as well as values so searches such as "district 3"
  // can match semantically, not only by the raw value.
  const p = feature.properties || {};
  return Object.entries(p)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
    .flatMap(([key, value]) => [key, value, `${key} ${value}`])
    .join(' ');
}

export function featureMatches(feature, query) {
  // Every query term must match, but each term may use normal or compact form.
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return true;
  }

  const blob = searchBlob(feature);
  const text = normalizeSearchText(blob);
  const compactText = compactSearchText(blob);
  const terms = normalizeSearchText(trimmedQuery).split(/\s+/).filter(Boolean);
  const compactTerms = terms.map(compactSearchText).filter(Boolean);

  return terms.every((term, index) => text.includes(term) || compactText.includes(compactTerms[index] || term));
}

export function groupFeaturesByLayer(layers, manifest, query) {
  // Build the sidebar hierarchy from the same search predicate used by the map.
  const layerConfigByName = layerLookup(manifest);

  return Object.entries(layers).map(([name, geojson]) => {
    const layerConfig = layerConfigByName[name] || { name };
    const groups = new Map();

    geojson.features
      .filter((feature) => featureMatches(feature, query))
      .forEach((feature, index) => {
        // Prefer manifest subgroup metadata, then use legacy project fallbacks.
        const subgroupField = layerConfig.subgroup_field;
        const subgroup = (subgroupField && feature.properties[subgroupField]) || feature.properties.layer || feature.properties.Site_typ || 'Unassigned';
        if (!groups.has(subgroup)) {
          groups.set(subgroup, []);
        }
        groups.get(subgroup).push({ feature, key: featureKey(feature, index, layerConfig) });
      });

    return {
      name,
      color: resolveLayerDisplay(layerConfig, layerConfig.index || 0).color,
      label_field: layerConfig.label_field,
      title: layerConfig.title || name,
      count: Array.from(groups.values()).reduce((sum, features) => sum + features.length, 0),
      groups: Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, features]) => ({
          name: groupName,
          features: features.sort((a, b) => siteLabel(a.feature, layerConfig).localeCompare(siteLabel(b.feature, layerConfig))),
        })),
    };
  });
}
