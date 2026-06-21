import { useEffect } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { layerLookup } from '../config/displayDefaults';
import { DETAIL_ZOOM, INITIAL_CENTER, INITIAL_ZOOM, MIN_ZOOM } from '../config/mapConfig';
import { bindPopup, markerStyle, styleFeature } from '../map/mapStyles';
import { featureCenter, featureKey, siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';

function MapFocus({ selectedSite }) {
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
  const map = useMapEvents({
    zoomend: () => onZoomChange?.(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange?.(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function FeatureDots({ layers, layerConfigByName, selectedSite, onSelectSite }) {
  return layers.flatMap(([name, geojson]) =>
    geojson.features.map((feature, index) => {
      const layerConfig = layerConfigByName[name] || { name };
      const center = featureCenter(feature);
      if (!center) {
        return null;
      }
      const key = featureKey(feature, index, layerConfig);

      return (
        <CircleMarker
          center={[center.latitude, center.longitude]}
          eventHandlers={{
            click: () => onSelectSite?.(feature, key, DETAIL_ZOOM + 2),
          }}
          key={`${name}-${key}`}
          pathOptions={markerStyle(selectedSite?.key === key)}
        >
          <Popup>
            <div className="map-popup">
              <strong>{siteLabel(feature, layerConfig)}</strong>
              <span>SPR ID: {feature.properties.SPR_ID ?? 'n/a'}</span>
              <span>Type: {feature.properties.Site_typ || feature.properties.layer_type || 'n/a'}</span>
              <span>District: {feature.properties.layer || 'n/a'}</span>
              <span>
                Center: {formatNumber(feature.properties.center_latitude, 5)},{' '}
                {formatNumber(feature.properties.center_longitude, 5)}
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
  className = 'map',
  manifest,
  onSelectSite,
  onZoomChange,
  query = '',
  selectedSite,
  showDetailShapes,
  visibleLayers,
}) {
  const layerConfigByName = layerLookup(manifest);

  return (
    <MapContainer center={INITIAL_CENTER} zoom={INITIAL_ZOOM} minZoom={MIN_ZOOM} className={className}>
      <MapFocus selectedSite={selectedSite} />
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
            onEachFeature={(feature, layer) => bindPopup(feature, layer, layerConfigByName[name] || { name })}
            style={(feature) => styleFeature(feature, layerConfigByName[name] || { name })}
          />
        ))
      ) : (
        <FeatureDots
          layerConfigByName={layerConfigByName}
          layers={visibleLayers}
          onSelectSite={onSelectSite}
          selectedSite={selectedSite}
        />
      )}
    </MapContainer>
  );
}
