const ACRE_IN_SQUARE_METERS = 4046.8564;

export const LAND_COVER_BUCKETS = [
  { bucket: 'Developed', fields: ['DevOpe_21', 'DevLowI_22', 'DDevMed_23', 'DDevHig_24'] },
  { bucket: 'Forest', fields: ['DecFor_41', 'EverFor_42', 'MixFor_43'] },
  { bucket: 'Cultivated/Pasture', fields: ['CultCr_82', 'PasHay_81'] },
  { bucket: 'Grass/Shrub', fields: ['GrasHe_71', 'SShrub_52'] },
  { bucket: 'Water/Wetland', fields: ['OpenW_11', 'welan_90', 'EmerW_95'] },
  { bucket: 'Barren', fields: ['Barre_31'] },
];

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function flattenFeatures(layers = {}) {
  return Object.entries(layers).flatMap(([dataset, geojson]) =>
    (geojson?.features || []).map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        dataset: feature.properties?.dataset || dataset,
      },
    }))
  );
}

export function featureLabel(feature) {
  const p = feature.properties || {};
  return p.Unit_Site || p.SPR_ID || p.feature_id || 'Unnamed site';
}

export function squareMetersToAcres(value) {
  const number = numberOrNull(value);
  return number === null ? null : number / ACRE_IN_SQUARE_METERS;
}

export function sumSiteAcres(layers) {
  return flattenFeatures(layers).reduce((sum, feature) => sum + (squareMetersToAcres(feature.properties?.Shape_Area) || 0), 0);
}

export function distinctValues(layers, field) {
  return [...new Set(flattenFeatures(layers).map((feature) => feature.properties?.[field]).filter(Boolean))].sort();
}

export function sitesByDistrict(layers) {
  return byCategory(layers, 'layer').map(({ value, count }) => ({ district: value, count }));
}

export function byCategory(layers, field) {
  const counts = new Map();
  flattenFeatures(layers).forEach((feature) => {
    const value = feature.properties?.[field] || 'Unknown';
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function sitesByLayer(layers) {
  return Object.entries(layers)
    .map(([name, geojson]) => ({ layer: name, count: geojson?.features?.length || 0 }))
    .sort((a, b) => b.count - a.count || a.layer.localeCompare(b.layer));
}

export function sitesByType(layers) {
  return byCategory(layers, 'Site_typ').map(({ value, count }) => ({ type: value, count }));
}

function scoredValues(layers, key) {
  return flattenFeatures(layers)
    .map((feature) => numberOrNull(feature.properties?.[key]))
    .filter((value) => value !== null);
}

export function avgScoreByCriterion(layers, criteria) {
  return criteria.map((criterion) => {
    const values = scoredValues(layers, criterion.key);
    const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    return { key: criterion.key, label: criterion.label, mean, n: values.length };
  });
}

export function districtCriterionMatrix(layers, criteria) {
  const districts = distinctValues(layers, 'layer');
  const cells = Object.fromEntries(districts.map((district) => [district, {}]));

  districts.forEach((district) => {
    const districtFeatures = flattenFeatures(layers).filter((feature) => feature.properties?.layer === district);
    criteria.forEach((criterion) => {
      const values = districtFeatures.map((feature) => numberOrNull(feature.properties?.[criterion.key])).filter((value) => value !== null);
      cells[district][criterion.key] = {
        mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
        n: values.length,
      };
    });
  });

  return { districts, criteria, cells };
}

export function criterionScatter(layers, xKey = 'slp_s', yKey = 'sol_s') {
  return flattenFeatures(layers)
    .map((feature) => {
      const x = numberOrNull(feature.properties?.[xKey]);
      const y = numberOrNull(feature.properties?.[yKey]);
      if (x === null || y === null) {
        return null;
      }
      return {
        id: feature.properties?.SPR_ID || feature.properties?.feature_id || featureLabel(feature),
        label: featureLabel(feature),
        x,
        y,
        area: squareMetersToAcres(feature.properties?.Shape_Area) || 0,
        layer: feature.properties?.dataset,
        district: feature.properties?.layer || 'Unknown',
      };
    })
    .filter(Boolean);
}

export function landCoverComposition(layers) {
  const features = flattenFeatures(layers);
  const groups = [{ name: 'overall', features }];

  Object.entries(layers).forEach(([name, geojson]) => {
    groups.push({ name, features: geojson?.features || [] });
  });

  return groups.map(({ name, features: groupFeatures }) => ({
    group: name,
    segments: LAND_COVER_BUCKETS.map(({ bucket, fields }) => {
      const values = groupFeatures.map((feature) =>
        fields.reduce((sum, field) => sum + (numberOrNull(feature.properties?.[field]) || 0), 0)
      );
      return {
        bucket,
        pct: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
      };
    }),
  }));
}

export function areaHistogram(layers, binCount = 6) {
  const values = flattenFeatures(layers)
    .map((feature) => squareMetersToAcres(feature.properties?.Shape_Area))
    .filter((value) => value !== null);
  if (!values.length) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = max === min ? 1 : (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    min: min + width * index,
    max: index === binCount - 1 ? max : min + width * (index + 1),
    count: 0,
  }));

  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.floor((value - min) / width));
    bins[index].count += 1;
  });

  return bins;
}

export function projectKpis(layers) {
  return {
    totalSites: flattenFeatures(layers).length,
    districts: distinctValues(layers, 'layer').length,
    siteTypes: distinctValues(layers, 'Site_typ').length,
    totalAcres: sumSiteAcres(layers),
  };
}
