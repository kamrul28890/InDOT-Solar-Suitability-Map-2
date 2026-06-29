import { CRITERIA } from '../config/criteria';

export function featureHasCriterionScores(feature, criteria = CRITERIA) {
  const properties = feature?.properties || {};
  return criteria.some((criterion) => Number.isFinite(Number(properties[criterion.key])));
}

export function findScoredFeatureForSelection(feature, layerEntries = [], criteria = CRITERIA) {
  if (!feature || featureHasCriterionScores(feature, criteria)) {
    return feature;
  }

  const sprId = feature.properties?.SPR_ID;
  if (sprId === null || sprId === undefined || sprId === '') {
    return feature;
  }

  const match = layerEntries
    .flatMap(([, geojson]) => geojson?.features || [])
    .find(
      (candidate) =>
        candidate !== feature &&
        String(candidate.properties?.SPR_ID) === String(sprId) &&
        featureHasCriterionScores(candidate, criteria)
    );

  return match || feature;
}
