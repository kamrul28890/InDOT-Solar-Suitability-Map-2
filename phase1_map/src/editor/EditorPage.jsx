import { useMemo, useState } from 'react';

import { buildUpdatePackage } from './lib/buildPackage';
import { normalizeLayer } from './lib/normalizeLayer';
import { validateProject } from './lib/validate';
import { ConfigureStep } from './steps/ConfigureStep';
import { EditStep } from './steps/EditStep';
import { PreviewStep } from './steps/PreviewStep';
import { UploadStep } from './steps/UploadStep';

const steps = ['Upload', 'Configure', 'Edit', 'Validate', 'Preview & Export'];

export default function EditorPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [layers, setLayers] = useState([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const manifest = useMemo(
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
    setProcessing(true);
    setError('');
    try {
      const normalized = [];
      for (const [index, layer] of parsedLayers.entries()) {
        normalized.push(await normalizeLayer(layer, index));
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
    setLayers((current) => current.map((layer) => (layer.name === name ? updater(layer) : layer)));
  }

  function updateFeature(layerName, featureId, field, value) {
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
    await buildUpdatePackage({ manifest, layers });
  }

  function previousStep() {
    setActiveStep((current) => Math.max(0, current - 1));
  }

  function nextStep() {
    setActiveStep((current) => Math.min(steps.length - 1, current + 1));
  }

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <div>
          <a href="#/" className="back-link">Back to map</a>
          <h1>Map Editor</h1>
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

      {activeStep === 0 ? <UploadStep onLoaded={handleParsedLayers} /> : null}
      {activeStep === 1 ? <ConfigureStep layers={layers} onLayerChange={updateLayer} /> : null}
      {activeStep === 2 ? <EditStep layers={layers} onCellChange={updateFeature} /> : null}
      {activeStep === 3 ? (
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
      {activeStep === 4 ? (
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
