import { Layers, MapPin } from 'lucide-react';

import { layerColors } from '../config/mapConfig';
import { siteLabel } from '../utils/features';

export function LayerDirectory({ directoryLayers, enabled, selectedSite, onLayerToggle, onSiteSelect }) {
  return (
    <section className="control-group">
      <div className="section-title">
        <Layers size={18} aria-hidden="true" />
        <h2>Layers</h2>
      </div>
      <div className="tree-panel">
        {directoryLayers.map((layer) => (
          <details className="tree-node" key={layer.name}>
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
            <div className="tree-branch">
              {layer.groups.map((group) => (
                <details className="tree-group" key={`${layer.name}-${group.name}`}>
                  <summary>
                    <span>{group.name}</span>
                    <small>{group.features.length}</small>
                  </summary>
                  <div className="site-list">
                    {group.features.map(({ feature, key }) => (
                      <button
                        className={`site-row ${selectedSite?.key === key ? 'is-selected' : ''}`}
                        key={key}
                        onClick={() => onSiteSelect(feature, key)}
                        title={`Zoom to ${siteLabel(feature)}`}
                        type="button"
                      >
                        <MapPin size={15} aria-hidden="true" />
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
    </section>
  );
}
