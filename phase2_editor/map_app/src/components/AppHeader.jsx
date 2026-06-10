import { ChevronDown, Layers, Moon, Sun } from 'lucide-react';

import { basemapLayers } from '../config/mapConfig';

export function AppHeader({ basemapId, onBasemapChange, theme, onThemeToggle }) {
  return (
    <header className="app-header">
      <div>
        <span className="eyebrow">SPR 4862</span>
        <h1>INDOT Solar Suitability Map</h1>
      </div>
      <div className="header-actions">
        <details className="map-menu">
          <summary title="Map options">
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
        <button className="theme-toggle" onClick={onThemeToggle} title="Toggle theme" type="button">
          {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
