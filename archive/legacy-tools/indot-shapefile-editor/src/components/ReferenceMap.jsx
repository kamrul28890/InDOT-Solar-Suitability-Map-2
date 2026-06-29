import { useEffect, useRef } from 'react';
import L from 'leaflet';

export function ReferenceMap({ records, selectedRecord }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([39.76, -86.16], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    const features = (records || []).map((record) => ({
      type: 'Feature',
      geometry: record.geometry,
      properties: {
        feature_id: record.feature_id,
      },
    }));
    const selectedId = selectedRecord?.feature_id;
    const group = L.geoJSON({ type: 'FeatureCollection', features }, {
      style: (feature) => ({
        color: feature.properties.feature_id === selectedId ? '#0f8b8d' : '#7a8a84',
        weight: feature.properties.feature_id === selectedId ? 3 : 1,
        fillOpacity: feature.properties.feature_id === selectedId ? 0.34 : 0.08,
      }),
    }).addTo(map);
    layerRef.current = group;
    const selectedLayer = [];
    group.eachLayer((layer) => {
      if (layer.feature?.properties?.feature_id === selectedId) selectedLayer.push(layer);
    });
    const target = selectedLayer[0] || group;
    const bounds = target.getBounds?.();
    if (bounds?.isValid()) {
      map.fitBounds(bounds.pad(0.2));
    }
  }, [records, selectedRecord]);

  return <div className="reference-map" ref={containerRef} />;
}
