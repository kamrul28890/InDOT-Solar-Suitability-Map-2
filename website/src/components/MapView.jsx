import { MapPreview } from './MapPreview';

export function MapView({
  activeBasemap,
  activeCriterion,
  error,
  loading,
  selectedSite,
  userLocation,
  showDetailShapes,
  visibleLayers,
  onSelectSite,
  resolveFeatureForSelection,
  onZoomChange,
  query,
  manifest,
}) {
  // Keep loading/error overlays outside Leaflet so map layout remains stable
  // while data is fetched or a deployment file is missing.
  return (
    <section className="map-stage" aria-label="Interactive Indiana solar suitability map">
      <MapPreview
        activeBasemap={activeBasemap}
        activeCriterion={activeCriterion}
        manifest={manifest}
        onSelectSite={onSelectSite}
        resolveFeatureForSelection={resolveFeatureForSelection}
        onZoomChange={onZoomChange}
        query={query}
        selectedSite={selectedSite}
        showDetailShapes={showDetailShapes}
        userLocation={userLocation}
        visibleLayers={visibleLayers}
      />
      {loading || error ? (
        <div className={`map-status ${error ? 'is-error' : ''}`} role="status">
          <strong>{error ? 'Map data could not be loaded' : 'Loading map data'}</strong>
          <span>
            {error
              ? 'Check that the public site includes manifest.json and all referenced GeoJSON layers.'
              : 'Preparing the INDOT solar suitability layers.'}
          </span>
        </div>
      ) : null}
    </section>
  );
}
