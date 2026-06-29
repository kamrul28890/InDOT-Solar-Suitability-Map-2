import { useMemo, useState } from 'react';

import { DATASET_ORDER, matchDataset } from './config/schema';
import { buildUpdatePackage } from './lib/buildPackage';
import { normalizeLayer } from './lib/normalizeLayer';
import { validateProject } from './lib/validate';
import { EditStep } from './steps/EditStep';
import { PreviewStep } from './steps/PreviewStep';
import { UploadStep } from './steps/UploadStep';

const steps = ['Upload', 'Edit', 'Validate', 'Preview & Export'];
const BUILDER_INTRO_KEY = 'indot-builder-intro-confirmed';

export default function BuilderPage() {
  // The browser builder keeps the complete normalized project in memory. Source
  // files are read-only; only the downloaded update package contains changes.
  const [activeStep, setActiveStep] = useState(0);
  const [layers, setLayers] = useState([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [introAccepted, setIntroAccepted] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(BUILDER_INTRO_KEY) === 'yes';
  });

  const manifest = useMemo(
    // Rebuild deployment metadata whenever edits change normalized layer state.
    () => ({
      project: { name: 'INDOT Solar Suitability Map', default_crs: 'EPSG:4326' },
      layers: layers.map(({ geojson, ...layer }) => ({
        name: layer.name,
        title: layer.title,
        layer_type: layer.layer_type,
        records: geojson.features.length,
        bounds: layer.bounds,
        source_valid_geometries: layer.source_valid_geometries,
        fixed_geometries: layer.fixed_geometries,
        geometry_type: layer.geometry_type,
        color: layer.color,
        label_field: layer.label_field,
        subgroup_field: layer.subgroup_field,
        popup_fields: layer.popup_fields,
        score_fields: layer.score_fields,
        score_color_field: layer.score_color_field || null,
      })),
    }),
    [layers]
  );
  const validation = useMemo(() => validateProject(layers), [layers]);

  async function handleParsedLayers(parsedLayers) {
    // Require exactly the three known project datasets. Matching by configured
    // source stems prevents accidental updates from unrelated shapefiles.
    setProcessing(true);
    setError('');
    try {
      const matches = new Map();
      const unknown = [];
      for (const layer of parsedLayers) {
        const dataset = matchDataset(layer.rawName);
        if (dataset) {
          matches.set(dataset.name, { layer, dataset });
        } else {
          unknown.push(layer.rawName);
        }
      }
      if (unknown.length) {
        throw new Error(
          `Unrecognized shapefile(s): ${unknown.join(', ')}. The Map Builder accepts the three INDOT datasets only.`
        );
      }
      const missing = DATASET_ORDER.filter((name) => !matches.has(name));
      if (missing.length) {
        throw new Error(`Missing required dataset(s): ${missing.join(', ')}. Upload all three INDOT shapefiles together.`);
      }

      const normalized = [];
      for (const name of DATASET_ORDER) {
        // Preserve configured layer order in the builder, manifest, and package.
        const { layer, dataset } = matches.get(name);
        normalized.push(await normalizeLayer(layer, dataset));
      }
      setLayers(normalized);
      setActiveStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function updateLayer(name, updater) {
    // Immutable replacement keeps React memoization and validation dependable.
    setLayers((current) => current.map((layer) => (layer.name === name ? updater(layer) : layer)));
  }

  function updateFeature(layerName, featureId, field, value) {
    // Update only the targeted feature property while preserving GeoJSON shape.
    updateLayer(layerName, (layer) => ({
      ...layer,
      geojson: {
        ...layer.geojson,
        features: layer.geojson.features.map((feature) =>
          feature.properties.feature_id === featureId
            ? { ...feature, properties: { ...feature.properties, [field]: value } }
            : feature
        ),
      },
    }));
  }

  async function downloadPackage() {
    // The generated ZIP mirrors data/processed for direct replacement.
    await buildUpdatePackage({ manifest, layers });
  }

  function previousStep() {
    setActiveStep((current) => Math.max(0, current - 1));
  }

  function nextStep() {
    setActiveStep((current) => Math.min(steps.length - 1, current + 1));
  }

  function acceptIntro() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BUILDER_INTRO_KEY, 'yes');
    }
    setIntroAccepted(true);
  }

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <div>
          <a href="#/map" className="back-link">Back to map</a>
          <h1>Map Builder</h1>
          <p>Browser workspace for inspecting, validating, previewing, and packaging project shapefiles.</p>
        </div>
        <div className="editor-header-controls">
          <ol className="editor-steps">
            {steps.map((step, index) => (
              <li className={index === activeStep ? 'is-active' : index < activeStep ? 'is-done' : ''} key={step}>
                {step}
              </li>
            ))}
          </ol>
          <StepActions activeStep={activeStep} onBack={previousStep} onNext={nextStep} />
        </div>
      </header>

      {error ? <p className="error-message">{error}</p> : null}
      {processing ? <p className="status-message">Reading shapefiles and repairing geometries...</p> : null}

      <section className="editor-panel editor-intro-panel">
        <div>
          <span className="site-eyebrow">Browser map builder</span>
          <h2>Inspect, validate, preview, and package shapefile updates</h2>
          <p>
            Upload the three project shapefiles to review attributes, validate geometry, preview the public map output,
            and download a ZIP that mirrors <code>data/processed</code>. Files stay in your browser; this static site
            does not upload them to a server.
          </p>
          <p>
            The primary maintainer workflow is to use the exported ZIP for site data updates, but the workspace is also
            useful for open-access review, local QA, and confirming that the project shapefiles normalize correctly.
          </p>
        </div>
        {!introAccepted ? (
          <button className="primary-button" onClick={acceptIntro} type="button">
            Start workspace
          </button>
        ) : null}
      </section>

      {activeStep === 0 && introAccepted ? <UploadStep onLoaded={handleParsedLayers} /> : null}
      {activeStep === 1 ? <EditStep layers={layers} onCellChange={updateFeature} /> : null}
      {activeStep === 2 ? (
        <section className="editor-panel">
          <h2>Validate</h2>
          <div className="validation-grid">
            {layers.map((layer) => (
              <article className="validation-card" key={layer.name}>
                <h3>{layer.title}</h3>
                <p>
                  {layer.source_valid_geometries} valid, {layer.fixed_geometries} repaired, {layer.escalated_geometries || 0} escalated
                </p>
                <p>{validation.byLayer[layer.name]?.errors.length || 0} errors, {validation.byLayer[layer.name]?.warnings.length || 0} warnings</p>
              </article>
            ))}
          </div>
          <IssueList validation={validation} />
        </section>
      ) : null}
      {activeStep === 3 ? (
        <PreviewStep layers={layers} manifest={manifest} validation={validation} onDownload={downloadPackage} />
      ) : null}

      {activeStep > 0 ? (
        <footer className="editor-footer">
          <StepActions activeStep={activeStep} onBack={previousStep} onNext={nextStep} />
        </footer>
      ) : null}
    </main>
  );
}

function StepActions({ activeStep, onBack, onNext }) {
  // Shared header/footer controls keep navigation reachable on long edit pages.
  if (activeStep === 0) {
    return null;
  }
  const nextLabel = activeStep === steps.length - 1 ? 'Review package' : `Next: ${steps[activeStep + 1]}`;
  return (
    <div className="step-actions">
      <button className="secondary-button" type="button" onClick={onBack}>
        Back
      </button>
      <button className="primary-button" type="button" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}

function IssueList({ validation }) {
  // Cap rendered issues to keep the browser responsive for highly invalid data;
  // aggregate counts remain available in the layer validation cards.
  const issues = [...validation.errors, ...validation.warnings];
  if (!issues.length) {
    return <p className="status-message">No validation issues found.</p>;
  }
  return (
    <div className="issue-list">
      {issues.slice(0, 80).map((issue) => (
        <div className={`issue-row is-${issue.severity}`} key={`${issue.layer}-${issue.feature_id}-${issue.field}-${issue.message}`}>
          <strong>{issue.severity}</strong>
          <span>{issue.layer} / {issue.feature_id} / {issue.field}: {issue.message}</span>
        </div>
      ))}
    </div>
  );
}
