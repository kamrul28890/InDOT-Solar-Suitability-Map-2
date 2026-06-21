import { MapPreview } from './MapPreview';

export function MapView({
  activeBasemap,
  error,
  loading,
  selectedSite,
  showDetailShapes,
  visibleLayers,
  onSelectSite,
  onZoomChange,
  query,
  manifest,
}) {
  return (
    <section className="map-stage" aria-label="Interactive Indiana solar suitability map">
      <MapPreview
        activeBasemap={activeBasemap}
        manifest={manifest}
        onSelectSite={onSelectSite}
        onZoomChange={onZoomChange}
        query={query}
        selectedSite={selectedSite}
        showDetailShapes={showDetailShapes}
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
