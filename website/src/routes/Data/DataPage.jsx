import { useEffect, useState } from 'react';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CRITERIA } from '../../config/criteria';
import { useAppData } from '../../utils/useAppData';

const COMMON_FIELDS = [
  'SPR_ID',
  'Site_typ',
  'Unit_Site',
  'layer',
  'Volt_Class',
  'Flood_Zone',
  'Fld_Area',
  'Fld_ZoneYr',
  'Fld_Perc',
  'SlopeMean',
  'Solar_Mean',
  'NTran_DIST',
  'Shape_Area',
  'land_area',
  'center_latitude',
  'center_longitude',
  'land_cover_sum',
  'source_geometry_valid',
];

function fileUrl(fileName) {
  return `${import.meta.env.BASE_URL}data/processed/${fileName}`;
}

export default function DataPage() {
  const { manifest, layers } = useAppData();
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}deployment-metadata.json`)
      .then((response) => (response.ok ? response.json() : null))
      .then(setMetadata)
      .catch(() => setMetadata(null));
  }, []);

  const downloads = [
    ...(manifest?.layers || []).map((layer) => ({
      file: `${layer.name}.geojson`,
      label: layer.title || layer.name,
      records: layer.records ?? layers[layer.name]?.features?.length ?? 0,
    })),
    { file: 'manifest.json', label: 'Manifest', records: manifest?.layers?.length || 0 },
  ];

  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Data</span>
        <h1>Downloads, dictionary, and citation</h1>
        <p>Published GeoJSON and manifest files are served from the static GitHub Pages build.</p>
      </header>

      <div className="download-grid">
        {downloads.map((item) => (
          <Card key={item.file}>
            <h3>{item.label}</h3>
            <p>
              <code>{item.file}</code> | {item.records} records
            </p>
            <a className="ui-button ui-button--secondary" href={fileUrl(item.file)}>
              Download
            </a>
          </Card>
        ))}
      </div>

      <Card>
        <h3>Provenance / last updated</h3>
        <p>
          Last updated:{' '}
          {metadata?.generated_at_utc ? new Date(metadata.generated_at_utc).toLocaleString() : 'TODO(confirm): deployment metadata unavailable in this runtime'}
        </p>
        <p>Target site: {metadata?.target_site || 's2hublab.github.io/indot-solar-suitability-map'}</p>
      </Card>

      <div className="method-table-wrap">
        <table className="content-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {COMMON_FIELDS.map((field) => (
              <tr key={field}>
                <td>
                  <code>{field}</code>
                </td>
                <td>Published map attribute used for search, popups, filters, or provenance.</td>
              </tr>
            ))}
            {CRITERIA.map((criterion) => (
              <tr key={criterion.key}>
                <td>
                  <code>{criterion.key}</code>
                </td>
                <td>
                  {criterion.label} 0-1 sub-score. {criterion.measures}.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <h3>Citation</h3>
        <p>
          S2-HUB Lab, Purdue University (2026). <em>INDOT Solar Suitability Map (SPR 4862 / Indiana Solar Roadmap)</em>{' '}
          [Data set / Web application].
        </p>
        <pre>{`@misc{s2hub_indot_solar_2026,
  author = {S2-HUB Lab, Purdue University},
  title = {INDOT Solar Suitability Map (SPR 4862 / Indiana Solar Roadmap)},
  year = {2026},
  note = {Data set / Web application}
}`}</pre>
      </Card>

      <Card>
        <h3>License</h3>
        <p>
          Repository code is MIT licensed. Processed map data and content are offered under CC BY 4.0 with attribution
          to the S2-HUB Lab, Purdue University. Please cite as above.
        </p>
      </Card>

      <Card>
        <h3>Map Builder</h3>
        <p>
          Use the in-browser Map Builder to inspect, validate, preview, and package the project shapefiles. Maintainers can
          use the exported ZIP for the documented GitHub update workflow.
        </p>
        <Button to="/builder" variant="secondary">
          Open Map Builder
        </Button>
      </Card>
    </section>
  );
}
