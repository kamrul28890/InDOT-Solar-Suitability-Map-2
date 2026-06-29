import { LocateFixed, Maximize2, Table2 } from 'lucide-react';

export function MapToolbar({ locationStatus, mode, onLocateUser, onModeChange }) {
  return (
    <section className="map-toolbar-wrap">
      <div className="map-toolbar" aria-label="Map tools">
        <button onClick={() => onModeChange(mode === 'map' ? 'table' : 'map')} type="button">
          <Table2 size={16} aria-hidden="true" />
          {mode === 'map' ? 'Table' : 'Map'}
        </button>
        <button onClick={() => document.querySelector('.map-stage')?.requestFullscreen?.()} type="button">
          <Maximize2 size={16} aria-hidden="true" />
          Fullscreen
        </button>
        <button onClick={onLocateUser} type="button">
          <LocateFixed size={16} aria-hidden="true" />
          Near me
        </button>
      </div>
      {locationStatus ? <p className="map-toolbar-status">{locationStatus}</p> : null}
    </section>
  );
}
