import { useEffect } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { layerLookup } from '../config/displayDefaults';
import { DETAIL_ZOOM, INITIAL_CENTER, INITIAL_ZOOM, MIN_ZOOM } from '../config/mapConfig';
import { bindPopup, markerStyle, styleFeature } from '../map/mapStyles';
import { featureCenter, featureKey, siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';

function MapFocus({ selectedSite }) {
  // React-Leaflet child components can access the imperative map instance.
  const map = useMap();

  useEffect(() => {
    if (!selectedSite) {
      return;
    }
    map.flyTo([selectedSite.latitude, selectedSite.longitude], selectedSite.targetZoom || DETAIL_ZOOM, { duration: 0.8 });
  }, [map, selectedSite]);

  return null;
}

function ZoomState({ onZoomChange }) {
  // Mirror Leaflet zoom into React so the app can switch rendering strategies.
  const map = useMapEvents({
    zoomend: () => onZoomChange?.(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange?.(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function UserLocationMarker({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) {
      return;
    }
    map.flyTo([userLocation.latitude, userLocation.longitude], Math.max(map.getZoom(), 12), { duration: 0.8 });
  }, [map, userLocation]);

  if (!userLocation) {
    return null;
  }

  return (
    <CircleMarker
      center={[userLocation.latitude, userLocation.longitude]}
      pathOptions={{ color: '#ffffff', fillColor: '#f59e0b', fillOpacity: 0.95, radius: 10, weight: 3 }}
    >
      <Popup>
        <div className="map-popup">
          <strong>Your approximate location</strong>
          <span>Accuracy: {formatNumber(userLocation.accuracy, 0)} m</span>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function FeatureDots({ activeCriterion, layers, layerConfigByName, selectedSite, onSelectSite, resolveFeatureForSelection = (feature) => feature }) {
  // Low zoom uses one representative-point marker per polygon. This is much
  // lighter and more legible than rendering thousands of parcel boundaries.
  return layers.flatMap(([name, geojson]) =>
    geojson.features.map((feature, index) => {
      const layerConfig = layerConfigByName[name] || { name };
      const center = featureCenter(feature);
      if (!center) {
        return null;
      }
      const key = featureKey(feature, index, layerConfig);
      const selectableFeature = resolveFeatureForSelection(feature) || feature;
      const selectableLayerConfig = layerConfigByName[selectableFeature.properties?.dataset] || layerConfig;
      const selectableKey = featureKey(selectableFeature, index, selectableLayerConfig);

      return (
        <CircleMarker
          center={[center.latitude, center.longitude]}
          eventHandlers={{
            click: () => onSelectSite?.(selectableFeature, selectableKey, DETAIL_ZOOM + 2),
          }}
          key={`${name}-${key}`}
          pathOptions={markerStyle(selectedSite?.key === selectableKey, selectableFeature.properties?.[activeCriterion])}
        >
          <Popup>
            <div className="map-popup">
              <strong>{siteLabel(selectableFeature, selectableLayerConfig)}</strong>
              <span>SPR ID: {selectableFeature.properties.SPR_ID ?? 'n/a'}</span>
              <span>Type: {selectableFeature.properties.Site_typ || selectableFeature.properties.layer_type || 'n/a'}</span>
              <span>District: {selectableFeature.properties.layer || 'n/a'}</span>
              <span>
                Center: {formatNumber(selectableFeature.properties.center_latitude, 5)},{' '}
                {formatNumber(selectableFeature.properties.center_longitude, 5)}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      );
    })
  );
}

export function MapPreview({
  activeBasemap,
  activeCriterion,
  className = 'map',
  manifest,
  onSelectSite,
  onZoomChange,
  query = '',
  resolveFeatureForSelection = (feature) => feature,
  selectedSite,
  showDetailShapes,
  userLocation,
  visibleLayers,
}) {
  // At DETAIL_ZOOM the renderer swaps overview markers for exact geometries;
  // both modes consume the same filtered visibleLayers collection.
  const layerConfigByName = layerLookup(manifest);

  return (
    <MapContainer center={INITIAL_CENTER} zoom={INITIAL_ZOOM} minZoom={MIN_ZOOM} className={className}>
      <MapFocus selectedSite={selectedSite} />
      <UserLocationMarker userLocation={userLocation} />
      <ZoomState onZoomChange={onZoomChange} />
      <TileLayer attribution={activeBasemap.attribution} url={activeBasemap.url} />
      {activeBasemap.overlayUrl ? (
        <TileLayer attribution={activeBasemap.overlayAttribution} url={activeBasemap.overlayUrl} opacity={0.9} />
      ) : null}
      {showDetailShapes ? (
        visibleLayers.map(([name, geojson]) => (
          <GeoJSON
            data={geojson}
            key={`${name}-${query}-${geojson.features.length}`}
            onEachFeature={(feature, layer) => {
              const layerConfig = layerConfigByName[name] || { name };
              const selectableFeature = resolveFeatureForSelection(feature) || feature;
              const selectableLayerConfig = layerConfigByName[selectableFeature.properties?.dataset] || layerConfig;
              bindPopup(selectableFeature, layer, selectableLayerConfig);
              layer.on('click', () =>
                onSelectSite?.(selectableFeature, featureKey(selectableFeature, 0, selectableLayerConfig), DETAIL_ZOOM + 1)
              );
            }}
            style={(feature) => styleFeature(feature, layerConfigByName[name] || { name }, activeCriterion)}
          />
        ))
      ) : (
        <FeatureDots
          activeCriterion={activeCriterion}
          layerConfigByName={layerConfigByName}
          layers={visibleLayers}
          onSelectSite={onSelectSite}
          resolveFeatureForSelection={resolveFeatureForSelection}
          selectedSite={selectedSite}
        />
      )}
    </MapContainer>
  );
}
