import { Download, LocateFixed, MapPinned, Navigation, Share2, X } from 'lucide-react';

import { CRITERIA } from '../config/criteria';
import { distanceMilesBetween, googleMapsDirectionsUrl } from '../utils/distance';
import { featureCenter, siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';
import { buildShareLink } from '../utils/shareLinks';
import { ScoreBars } from './ScoreBars';

function downloadFeature(feature) {
  const id = feature?.properties?.SPR_ID || 'site';
  const blob = new Blob([JSON.stringify(feature, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${id}.geojson`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SiteDetailPanel({ layerConfig, locationStatus, onClose, onLocateUser, onZoomTo, selectedSite, userLocation }) {
  const feature = selectedSite?.feature;
  if (!feature) {
    return null;
  }

  const p = feature.properties || {};
  const center = featureCenter(feature);
  const shareLink = buildShareLink({ site: p.SPR_ID, color: selectedSite.activeCriterion });
  const milesFromUser = center && userLocation ? distanceMilesBetween(userLocation, center) : null;
  const directionsUrl = center ? googleMapsDirectionsUrl(center, userLocation) : '';

  return (
    <aside className="site-detail-panel" aria-label="Selected site details">
      <div className="site-detail-panel__header">
        <div>
          <span className="site-eyebrow">Selected site</span>
          <h2>{siteLabel(feature, layerConfig)}</h2>
          <p>
            SPR {p.SPR_ID ?? 'n/a'} | {p.Site_typ || 'Site'} | {p.layer || 'Unknown district'}
          </p>
        </div>
        <button className="theme-toggle" onClick={onClose} type="button" aria-label="Close site details">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <ScoreBars feature={feature} />

      <dl className="site-attributes">
        <div>
          <dt>Solar mean</dt>
          <dd>{formatNumber(p.Solar_Mean, 2)}</dd>
        </div>
        <div>
          <dt>Voltage class</dt>
          <dd>{p.Volt_Class || 'n/a'}</dd>
        </div>
        <div>
          <dt>Flood zone</dt>
          <dd>{p.Flood_Zone || 'n/a'}</dd>
        </div>
        <div>
          <dt>Slope mean</dt>
          <dd>{formatNumber(p.SlopeMean, 3)}</dd>
        </div>
        <div>
          <dt>Transmission distance</dt>
          <dd>{formatNumber(p.NTran_DIST, 2)}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{formatNumber(p.Shape_Area, 0)} m2</dd>
        </div>
      </dl>

      <div className="site-distance">
        <div>
          <span className="site-distance__label">Distance from your location</span>
          <strong>{milesFromUser === null ? 'Use location' : `${formatNumber(milesFromUser, 1)} mi`}</strong>
          <p>{milesFromUser === null ? locationStatus || 'Use browser location to estimate straight-line distance.' : 'Approximate straight-line distance.'}</p>
        </div>
        <button className="theme-toggle" onClick={onLocateUser} type="button" aria-label="Use my location for distance">
          <MapPinned size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="site-detail-panel__actions">
        <button className="ui-button ui-button--secondary" onClick={() => onZoomTo?.(feature)} type="button">
          <LocateFixed size={16} aria-hidden="true" />
          Zoom
        </button>
        <button
          className="ui-button ui-button--secondary"
          onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}${shareLink}`)}
          type="button"
        >
          <Share2 size={16} aria-hidden="true" />
          Copy link
        </button>
        {directionsUrl ? (
          <a className="ui-button ui-button--secondary" href={directionsUrl} rel="noreferrer" target="_blank">
            <Navigation size={16} aria-hidden="true" />
            Directions
          </a>
        ) : null}
        <button className="ui-button ui-button--secondary" onClick={() => downloadFeature(feature)} type="button">
          <Download size={16} aria-hidden="true" />
          GeoJSON
        </button>
      </div>

      <details className="score-definition-list">
        <summary>Score definitions</summary>
        {CRITERIA.map((criterion) => (
          <p key={criterion.key}>
            <strong>{criterion.label}:</strong> {criterion.measures}
          </p>
        ))}
      </details>
    </aside>
  );
}
