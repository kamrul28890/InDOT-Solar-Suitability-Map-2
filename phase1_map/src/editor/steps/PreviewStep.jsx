import { useMemo, useState } from 'react';

import { MapPreview } from '../../components/MapPreview';
import { DETAIL_ZOOM, basemapLayers } from '../../config/mapConfig';

export function PreviewStep({ layers, manifest, validation, onDownload }) {
  const [zoom, setZoom] = useState(DETAIL_ZOOM);
  const visibleLayers = useMemo(() => layers.map((layer) => [layer.name, layer.geojson]), [layers]);

  return (
    <section className="editor-panel preview-panel">
      <div className="table-header">
        <div>
          <h2>Preview & export</h2>
          <p className="hint">{validation.valid ? 'Ready to export.' : 'Fix validation errors before exporting.'}</p>
        </div>
        <button className="primary-button" type="button" disabled={!validation.valid} onClick={onDownload}>
          Download update ZIP
        </button>
      </div>
      <div className="editor-map">
        <MapPreview
          activeBasemap={basemapLayers[0]}
          className="map"
          manifest={manifest}
          onZoomChange={setZoom}
          showDetailShapes={zoom >= DETAIL_ZOOM}
          visibleLayers={visibleLayers}
        />
      </div>
    </section>
  );
}
