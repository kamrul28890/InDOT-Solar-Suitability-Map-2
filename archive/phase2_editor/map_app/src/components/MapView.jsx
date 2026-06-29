import { useEffect } from 'react';
import { ChevronDown, Layers, MapPin } from 'lucide-react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { DETAIL_ZOOM, INITIAL_CENTER, INITIAL_ZOOM, MIN_ZOOM, basemapLayers } from '../config/mapConfig';
import { layerColors } from '../config/mapConfig';
import { featureCenter, featureKey, siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';
import { bindPopup, markerStyle, styleFeature } from '../map/mapStyles';

function MapFocus({ selectedSite }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedSite) {
      return;
    }
    if (selectedSite.bounds) {
      map.flyToBounds(selectedSite.bounds, {
        duration: 0.8,
        maxZoom: selectedSite.targetZoom || DETAIL_ZOOM + 2,
        padding: [32, 32],
      });
      return;
    }
    map.flyTo([selectedSite.latitude, selectedSite.longitude], selectedSite.targetZoom || DETAIL_ZOOM, { duration: 0.8 });
  }, [map, selectedSite]);

  return null;
}

function ZoomState({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function FeatureDots({ layers, selectedSite, onSelectSite }) {
  return layers.flatMap(([name, geojson]) =>
    geojson.features.map((feature, index) => {
      const center = featureCenter(feature);
      if (!center) {
        return null;
      }
      const key = featureKey(feature, index);

      return (
        <CircleMarker
          center={[center.latitude, center.longitude]}
          eventHandlers={{
            click: () => onSelectSite(feature, key, DETAIL_ZOOM + 2),
          }}
          key={`${name}-${key}`}
          pathOptions={markerStyle(selectedSite?.key === key)}
        >
          <Popup>
            <div className="map-popup">
              <strong>{siteLabel(feature)}</strong>
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

function DetailShapes({ layers, onSelectSite, query, selectedSite }) {
  return layers.map(([name, geojson]) => (
    <GeoJSON
      data={geojson}
      key={`${name}-${query}-${geojson.features.length}-detail-${selectedSite?.key || 'none'}`}
      onEachFeature={(feature, layer) => {
        bindPopup(feature, layer);
        layer.on('click', () => {
          const key = featureKey(feature);
          onSelectSite(feature, key, DETAIL_ZOOM + 2);
        });
      }}
      style={(feature) => styleFeature(feature, selectedSite?.key === featureKey(feature))}
    />
  ));
}

function MapLayerControl({ enabled, layers, onLayerToggle, onSiteSelect, selectedSite }) {
  return (
    <div className="map-layer-control" aria-label="Map layer controls">
      <strong>Layers</strong>
      {layers.map((layer) => (
        <details className="map-layer-node" key={layer.name}>
          <summary>
            <input
              type="checkbox"
              checked={enabled[layer.name] ?? false}
              onChange={(event) => onLayerToggle(layer.name, event.target.checked)}
              onClick={(event) => event.stopPropagation()}
            />
            <span className="swatch" style={{ backgroundColor: layerColors[layer.name] }} />
            <span>{layer.title}</span>
            <small>{layer.count}</small>
          </summary>
          <div className="map-layer-branch">
            {layer.groups.map((group) => (
              <details className="map-layer-group" key={`${layer.name}-${group.name}`}>
                <summary>
                  <span>{group.name}</span>
                  <small>{group.features.length}</small>
                </summary>
                <div className="map-site-list">
                  {group.features.map(({ feature, key }) => (
                    <button
                      className={`map-site-row ${selectedSite?.key === key ? 'is-selected' : ''}`}
                      key={key}
                      onClick={() => onSiteSelect(feature, key)}
                      title={`Zoom to ${siteLabel(feature)}`}
                      type="button"
                    >
                      <MapPin size={14} aria-hidden="true" />
                      <span>
                        <strong>{siteLabel(feature)}</strong>
                        <small>
                          SPR {feature.properties.SPR_ID ?? 'n/a'} |{' '}
                          {feature.properties.Site_typ || feature.properties.layer_type || 'site'}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
            {layer.groups.length === 0 ? <p className="empty-tree">No matching sites</p> : null}
          </div>
        </details>
      ))}
    </div>
  );
}

function BasemapControl({ basemapId, onBasemapChange }) {
  return (
    <details className="map-menu map-basemap-control">
      <summary title="Basemap options">
        <Layers size={18} aria-hidden="true" />
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="map-menu-panel">
        <div className="menu-title">Basemap</div>
        <div className="basemap-picker" role="listbox" aria-label="Map basemap options">
          {basemapLayers.map((layer) => (
            <button
              key={layer.id}
              className={`basemap-option ${basemapId === layer.id ? 'is-active' : ''}`}
              onClick={() => onBasemapChange(layer.id)}
              type="button"
            >
              <span className="basemap-swatch" data-basemap={layer.id} />
              <span className="basemap-text">
                <strong>{layer.name}</strong>
                <small>{layer.id === 'esri-hybrid' ? 'Imagery with labels' : 'Standard map option'}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

export function MapView({
  activeBasemap,
  basemapId,
  enabled,
  layerControls,
  onBasemapChange,
  selectedSite,
  showDetailShapes,
  visibleLayers,
  onLayerToggle,
  onSelectSite,
  onZoomChange,
  query,
}) {
  return (
    <section className="map-stage" aria-label="Interactive Indiana solar suitability map">
      <div className="map-controls" aria-label="Map controls">
        <MapLayerControl
          enabled={enabled}
          layers={layerControls}
          onLayerToggle={onLayerToggle}
          onSiteSelect={onSelectSite}
          selectedSite={selectedSite}
        />
        <BasemapControl basemapId={basemapId} onBasemapChange={onBasemapChange} />
      </div>
      <MapContainer center={INITIAL_CENTER} zoom={INITIAL_ZOOM} minZoom={MIN_ZOOM} className="map">
        <MapFocus selectedSite={selectedSite} />
        <ZoomState onZoomChange={onZoomChange} />
        <TileLayer attribution={activeBasemap.attribution} url={activeBasemap.url} />
        {activeBasemap.overlayUrl ? (
          <TileLayer attribution={activeBasemap.overlayAttribution} url={activeBasemap.overlayUrl} opacity={0.9} />
        ) : null}
        {showDetailShapes ? (
          <DetailShapes layers={visibleLayers} onSelectSite={onSelectSite} query={query} selectedSite={selectedSite} />
        ) : (
          <FeatureDots layers={visibleLayers} onSelectSite={onSelectSite} selectedSite={selectedSite} />
        )}
      </MapContainer>
    </section>
  );
}
