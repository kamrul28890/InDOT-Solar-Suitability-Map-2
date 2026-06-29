import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FolderOpen,
  ListChecks,
  Play,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Table2,
} from 'lucide-react';

import {
  autosaveStatus,
  browseFolder,
  exportZip,
  fullUrl,
  generatePreview,
  importFolder,
  loadFields,
  loadLayerRecords,
  patchCell,
  resetFields,
  resumeAutosave,
  revertFeature,
  revertField,
  saveLayerFields,
  undo,
  validateSession,
} from './api';
import { DataTable } from './components/DataTable.jsx';
import { ReferenceMap } from './components/ReferenceMap.jsx';

const STAGES = [
  { id: 'import', label: 'Import' },
  { id: 'fields', label: 'Fields' },
  { id: 'edit', label: 'Edit' },
  { id: 'validate', label: 'Validate' },
  { id: 'export', label: 'Preview & Export' },
];

const LAYERS = ['all_candidate_sites', 'facility_scored', 'row_scored'];

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function App() {
  const [stage, setStage] = useState('import');
  const [session, setSession] = useState(null);
  const [autosave, setAutosave] = useState(null);
  const [folderPath, setFolderPath] = useState('D:\\My Projects\\InDOT');
  const [fieldConfig, setFieldConfig] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all_candidate_sites');
  const [layerData, setLayerData] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [query, setQuery] = useState('');
  const [editedOnly, setEditedOnly] = useState(false);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [validation, setValidation] = useState(null);
  const [warningAck, setWarningAck] = useState(false);
  const [preview, setPreview] = useState(null);
  const [exported, setExported] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeFields = useMemo(() => fieldConfig?.field_config?.[activeLayer] || {}, [fieldConfig, activeLayer]);
  const activeLayerTitle = session?.layers?.find((layer) => layer.name === activeLayer)?.title || activeLayer;
  const canContinueFromValidation = validation?.valid || (validation && validation.errors.length === 0 && validation.warnings.length > 0 && warningAck);

  useEffect(() => {
    autosaveStatus().then(setAutosave).catch(() => setAutosave(null));
  }, []);

  async function run(task, successMessage = '') {
    setBusy(true);
    setError('');
    try {
      const result = await task();
      if (successMessage) setMessage(successMessage);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function loadFieldState(sessionId) {
    const fields = await loadFields(sessionId);
    setFieldConfig(fields);
    return fields;
  }

  async function loadRecords(layer = activeLayer) {
    if (!session) return null;
    const data = await run(() => loadLayerRecords(session.session_id, layer, { query, editedOnly, errorsOnly }));
    if (data) {
      setLayerData(data);
      setSelectedRecord(data.records[0] || null);
    }
    return data;
  }

  async function handleBrowse() {
    const result = await run(() => browseFolder());
    if (result?.folder_path) setFolderPath(result.folder_path);
  }

  async function handleImport() {
    const result = await run(() => importFolder(folderPath), 'Import complete. Session auto-save is active.');
    if (!result) return;
    setSession(result);
    await loadFieldState(result.session_id);
    setStage('fields');
  }

  async function handleResume() {
    const result = await run(() => resumeAutosave(), 'Autosaved session restored.');
    if (!result) return;
    setSession(result);
    setFolderPath(result.source_folder);
    await loadFieldState(result.session_id);
    setStage('edit');
  }

  async function saveCurrentFields() {
    if (!session || !fieldConfig) return;
    const result = await run(() => saveLayerFields(session.session_id, activeLayer, activeFields), 'Field configuration saved.');
    if (result) await loadFieldState(session.session_id);
  }

  async function resetFieldConfig() {
    if (!session) return;
    const result = await run(() => resetFields(session.session_id), 'Field configuration reset to defaults.');
    if (result) setFieldConfig(result);
  }

  function updateField(fieldCode, patch) {
    setFieldConfig((current) => ({
      ...current,
      field_config: {
        ...current.field_config,
        [activeLayer]: {
          ...current.field_config[activeLayer],
          [fieldCode]: {
            ...current.field_config[activeLayer][fieldCode],
            ...patch,
          },
        },
      },
    }));
  }

  async function enterEditStage() {
    await saveCurrentFields();
    setStage('edit');
    await loadRecords(activeLayer);
  }

  async function saveCell(featureId, fieldCode, value) {
    if (!session) return;
    const result = await run(() => patchCell(session.session_id, activeLayer, featureId, fieldCode, value));
    if (result?.validation?.severity === 'error') {
      setMessage(result.validation.message);
    }
    await loadRecords(activeLayer);
  }

  async function handleRevertField(featureId, fieldCode) {
    await run(() => revertField(session.session_id, activeLayer, featureId, fieldCode), 'Cell reverted.');
    await loadRecords(activeLayer);
  }

  async function handleRevertRow(featureId) {
    await run(() => revertFeature(session.session_id, activeLayer, featureId), 'Row reverted.');
    await loadRecords(activeLayer);
  }

  async function handleUndo() {
    await run(() => undo(session.session_id), 'Most recent edit undone.');
    await loadRecords(activeLayer);
  }

  async function runValidation() {
    const result = await run(() => validateSession(session.session_id), 'Validation complete.');
    if (result) {
      setValidation(result);
      setStage('validate');
    }
  }

  async function enterPreview() {
    const result = await run(() => generatePreview(session.session_id), 'Preview generated.');
    if (result) {
      setPreview(result);
      setStage('export');
    }
  }

  async function handleExport() {
    const result = await run(() => exportZip(session.session_id), 'Export ZIP generated.');
    if (result) setExported(result);
  }

  useEffect(() => {
    if (stage === 'edit' && session) {
      loadRecords(activeLayer);
    }
  }, [activeLayer]);

  function renderImport() {
    return (
      <section className="stage-card">
        <div className="stage-title">
          <FolderOpen size={22} />
          <div>
            <h2>Stage 1: Import source shapefiles</h2>
            <p>Select the parent folder that contains the three required INDOT shapefile folders.</p>
          </div>
        </div>
        {autosave?.available ? (
          <div className="resume-card">
            <strong>Autosaved session found</strong>
            <span>{autosave.source_folder}</span>
            <span>Last saved: {autosave.last_saved_at}</span>
            <button className="secondary-button" onClick={handleResume}>Resume autosave</button>
          </div>
        ) : null}
        <div className="folder-row">
          <input value={folderPath} onChange={(event) => setFolderPath(event.target.value)} />
          <button className="secondary-button" onClick={handleBrowse} disabled={busy}>Browse</button>
          <button className="primary-button" onClick={handleImport} disabled={busy || !folderPath}>Import</button>
        </div>
        {session ? <LayerStatus layers={session.layers} /> : null}
      </section>
    );
  }

  function renderFields() {
    return (
      <section className="stage-card">
        <div className="stage-title">
          <Settings2 size={22} />
          <div>
            <h2>Stage 2: Field configuration</h2>
            <p>Choose popup fields, labels, and order. Internal fields stay hidden but remain available to the map.</p>
          </div>
        </div>
        <LayerTabs activeLayer={activeLayer} setActiveLayer={setActiveLayer} session={session} />
        <div className="field-config-table">
          <table>
            <thead>
              <tr>
                <th>Visible</th>
                <th>Field Code</th>
                <th>Display Label</th>
                <th>Type</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(activeFields)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([code, cfg]) => (
                  <tr className={cfg.internal ? 'is-internal' : ''} key={code}>
                    <td>
                      <input
                        type="checkbox"
                        checked={cfg.visible}
                        disabled={cfg.internal}
                        onChange={(event) => updateField(code, { visible: event.target.checked })}
                      />
                    </td>
                    <td>{code}</td>
                    <td>
                      <input value={cfg.label} disabled={cfg.internal} onChange={(event) => updateField(code, { label: event.target.value })} />
                    </td>
                    <td>{cfg.type}</td>
                    <td>
                      <input
                        type="number"
                        value={cfg.order}
                        disabled={cfg.internal}
                        onChange={(event) => updateField(code, { order: Number(event.target.value) })}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="stage-actions">
          <button className="secondary-button" onClick={resetFieldConfig}>Reset to Defaults</button>
          <button className="secondary-button" onClick={saveCurrentFields}>Save Field Configuration</button>
          <button className="primary-button" onClick={enterEditStage}>Continue to Review and Edit</button>
        </div>
      </section>
    );
  }

  function renderEdit() {
    return (
      <section className="stage-card full-height">
        <div className="stage-title">
          <Table2 size={22} />
          <div>
            <h2>Stage 3: Review and edit</h2>
            <p>Click a cell to edit it. Edits are auto-saved as deltas; source shapefiles are not modified.</p>
          </div>
        </div>
        <LayerTabs activeLayer={activeLayer} setActiveLayer={setActiveLayer} session={session} />
        <div className="edit-toolbar">
          <label className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search visible fields" />
          </label>
          <label><input type="checkbox" checked={editedOnly} onChange={(event) => setEditedOnly(event.target.checked)} /> Show edited only</label>
          <label><input type="checkbox" checked={errorsOnly} onChange={(event) => setErrorsOnly(event.target.checked)} /> Show errors only</label>
          <button className="secondary-button" onClick={() => loadRecords(activeLayer)}>Apply filters</button>
        </div>
        <div className="edit-layout">
          <DataTable
            layerData={layerData}
            selectedRecord={selectedRecord}
            onSelectRecord={setSelectedRecord}
            onSaveCell={saveCell}
            onRevertField={handleRevertField}
            onRevertRow={handleRevertRow}
            onUndo={handleUndo}
          />
          <aside className="reference-panel">
            <h2>Reference map</h2>
            <p className="hint">Display-only. The selected row is highlighted.</p>
            <ReferenceMap records={layerData?.records || []} selectedRecord={selectedRecord} />
          </aside>
        </div>
        <div className="stage-actions">
          <button className="secondary-button" onClick={() => setStage('fields')}>Back to Fields</button>
          <button className="primary-button" onClick={runValidation}>Validate</button>
        </div>
      </section>
    );
  }

  function renderValidate() {
    const issues = validation?.issues || [];
    return (
      <section className="stage-card">
        <div className="stage-title">
          <ListChecks size={22} />
          <div>
            <h2>Stage 4: Validate</h2>
            <p>Errors block export. Warnings require review before continuing.</p>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label="Total edits" value={validation?.edited_cells || 0} />
          <Metric label="Warnings" value={validation?.warnings?.length || 0} />
          <Metric label="Errors" value={validation?.errors?.length || 0} />
        </div>
        <div className="issue-list">
          <table>
            <thead>
              <tr><th>Layer</th><th>Feature ID</th><th>Field</th><th>Issue</th><th>Severity</th></tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={`${issue.layer}-${issue.feature_id}-${issue.field}-${index}`}>
                  <td>{issue.layer}</td>
                  <td>{issue.feature_id}</td>
                  <td>{issue.field}</td>
                  <td>{issue.issue}</td>
                  <td className={issue.severity === 'error' ? 'issue-error' : 'issue-warning'}>{issue.severity}</td>
                </tr>
              ))}
              {!issues.length ? <tr><td colSpan="5">No issues found.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {validation?.errors?.length ? (
          <p className="error-message">Fix all errors before continuing.</p>
        ) : validation?.warnings?.length ? (
          <label className="ack-row">
            <input type="checkbox" checked={warningAck} onChange={(event) => setWarningAck(event.target.checked)} />
            I have reviewed all warnings and want to proceed.
          </label>
        ) : (
          <p className="success-message">No errors or warnings. Ready for preview.</p>
        )}
        <div className="stage-actions">
          <button className="secondary-button" onClick={() => setStage('edit')}>Back to Edit</button>
          <button className="primary-button" onClick={enterPreview} disabled={!canContinueFromValidation}>Continue to Preview</button>
        </div>
      </section>
    );
  }

  function renderExport() {
    return (
      <section className="stage-card full-height">
        <div className="stage-title">
          <Download size={22} />
          <div>
            <h2>Stage 5: Preview and export</h2>
            <p>Preview the map exactly as visitors will see it, then generate a static deployment ZIP.</p>
          </div>
        </div>
        <div className="preview-frame-wrap">
          {preview ? <iframe className="preview-frame" src={fullUrl(preview.preview_url)} title="Map preview" /> : <p>No preview generated.</p>}
        </div>
        <div className="stage-actions">
          <button className="secondary-button" onClick={() => setStage('edit')}>Back to Edit</button>
          <button className="secondary-button" onClick={enterPreview}>Regenerate Preview</button>
          <button className="primary-button" onClick={handleExport}>Generate Export Package</button>
        </div>
        {exported ? (
          <div className="download-card">
            <CheckCircle2 size={20} />
            <div>
              <strong>Export package ready</strong>
              <span>{exported.feature_count} features, {exported.edited_cells} edited cells</span>
              <a href={fullUrl(exported.download_url)}>Download ZIP</a>
              <p>Unzip and upload all files into the public web folder. No server-side configuration is needed.</p>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">INDOT Phase 2</p>
          <h1>Solar Suitability Map Editor</h1>
        </div>
        <div className="autosave-indicator">
          <Save size={16} />
          {session ? `Auto-saved: ${session.autosave_path}` : 'No active session'}
        </div>
      </header>
      <nav className="wizard-steps">
        {STAGES.map((item, index) => (
          <button
            className={classNames('wizard-step', stage === item.id && 'is-active', index < stageIndex && 'is-complete')}
            disabled={!session && item.id !== 'import'}
            key={item.id}
            onClick={() => setStage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <section className="content-shell">
        {stage === 'import' ? renderImport() : null}
        {stage === 'fields' ? renderFields() : null}
        {stage === 'edit' ? renderEdit() : null}
        {stage === 'validate' ? renderValidate() : null}
        {stage === 'export' ? renderExport() : null}
      </section>
      {message ? <p className="toast message">{message}</p> : null}
      {error ? <p className="toast error-message"><AlertTriangle size={16} /> {error}</p> : null}
      {busy ? <div className="busy-overlay"><Play size={24} /> Working...</div> : null}
    </main>
  );
}

function LayerStatus({ layers }) {
  return (
    <div className="layer-status-grid">
      {layers.map((layer) => (
        <div className={classNames('layer-status', layer.status)} key={layer.name}>
          <strong>{layer.title}</strong>
          <span>{layer.records} features</span>
          <span>{layer.crs}</span>
          <span>{layer.invalid_geometries} geometry repairs queued</span>
        </div>
      ))}
    </div>
  );
}

function LayerTabs({ activeLayer, setActiveLayer, session }) {
  return (
    <div className="layer-tabs">
      {LAYERS.map((layerName) => {
        const layer = session?.layers?.find((item) => item.name === layerName);
        return (
          <button className={activeLayer === layerName ? 'is-active' : ''} key={layerName} onClick={() => setActiveLayer(layerName)}>
            {layer?.title || layerName}
          </button>
        );
      })}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
