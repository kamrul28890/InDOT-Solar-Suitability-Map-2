import { featureKey, siteLabel } from './features';

const SITE_PREFIX_PATTERN = /^(indotfac|interty)\s*-\s*/i;
const SITE_SUFFIX_PATTERN =
  /\s+(rest area|welcome center|truck park|maintenance unit|district complex|sub complex|unit|complex)\b.*$/i;
const DIRECTION_SUFFIX_PATTERN = /\s+(nb|sb|eb|wb|northbound|southbound|eastbound|westbound)$/i;

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function compactSearchText(value) {
  return normalizeSearchText(value).replace(/[^a-z0-9]/g, '');
}

function searchBlob(feature) {
  const p = feature.properties || {};
  return Object.entries(p)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
    .flatMap(([key, value]) => [key, value, `${key} ${value}`])
    .join(' ');
}

export function featureMatches(feature, query) {
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

function areaGroupLabel(feature) {
  const p = feature.properties || {};
  const unitSite = String(p.Unit_Site || '').trim();
  if (unitSite) {
    const withoutPrefix = unitSite.replace(SITE_PREFIX_PATTERN, '').trim();
    const withoutDirections = withoutPrefix.replace(DIRECTION_SUFFIX_PATTERN, '').trim();
    const withoutKnownSuffix = withoutDirections.replace(SITE_SUFFIX_PATTERN, '').trim();
    if (withoutKnownSuffix && !/^interty\b/i.test(withoutKnownSuffix)) {
      return withoutKnownSuffix;
    }
  }

  return p.layer || p.Site_typ || 'Unassigned';
}

export function groupFeaturesByLayer(layers, manifest, query) {
  const layerTitles = Object.fromEntries((manifest?.layers || []).map((layer) => [layer.name, layer.title]));

  return Object.entries(layers).map(([name, geojson]) => {
    const groups = new Map();

    geojson.features
      .filter((feature) => featureMatches(feature, query))
      .forEach((feature, index) => {
        const subgroup = areaGroupLabel(feature);
        if (!groups.has(subgroup)) {
          groups.set(subgroup, []);
        }
        groups.get(subgroup).push({ feature, key: featureKey(feature, index) });
      });

    return {
      name,
      title: layerTitles[name] || name,
      count: Array.from(groups.values()).reduce((sum, features) => sum + features.length, 0),
      groups: Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, features]) => ({
          name: groupName,
          features: features.sort((a, b) => siteLabel(a.feature).localeCompare(siteLabel(b.feature))),
        })),
    };
  });
}
