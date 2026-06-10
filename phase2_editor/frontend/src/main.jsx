import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const stages = ['Import', 'Fields', 'Edit', 'Validate', 'Preview'];

function App() {
  const [stage, setStage] = useState(0);
  const [folder, setFolder] = useState('');
  const [session, setSession] = useState(null);
  const [validation, setValidation] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function callApi(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async function importFolder() {
    try {
      setBusy(true);
      setMessage('');
      const result = await callApi('/api/import', {
        method: 'POST',
        body: JSON.stringify({ path: folder }),
      });
      setSession(result);
      setStage(1);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function chooseFolder() {
    try {
      setBusy(true);
      setMessage('Opening folder picker...');
      const result = await callApi('/api/browse-folder', { method: 'POST' });
      if (result.path) {
        setFolder(result.path);
        setMessage('Folder selected. Import it to continue.');
      } else {
        setMessage('Folder selection was cancelled.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function validateSession() {
    const result = await callApi('/api/validate', { method: 'POST' });
    setValidation(result);
    setStage(3);
  }

  async function generatePreview() {
    const result = await callApi('/api/preview/generate', { method: 'POST' });
    setMessage(`Preview generated: ${result.preview_url}`);
    setStage(4);
  }

  return (
    <main className="editor-shell">
      <header>
        <h1>INDOT Solar Editor</h1>
        <div className="stage-bar">
          {stages.map((name, index) => (
            <button className={index === stage ? 'active' : ''} key={name} onClick={() => setStage(index)}>
              {index + 1}. {name}
            </button>
          ))}
        </div>
      </header>

      {stage === 0 && (
        <section>
          <h2>Import</h2>
          <label>
            Shapefile project folder
            <input value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="D:\\My Projects\\InDOT\\phase1_map" />
          </label>
          <div className="actions">
            <button onClick={chooseFolder} disabled={busy}>Choose Folder</button>
            <button onClick={importFolder} disabled={!folder || busy}>Import Project</button>
          </div>
          {message && <p className="status-message">{message}</p>}
        </section>
      )}

      {stage === 1 && (
        <section>
          <h2>Field Configuration</h2>
          <p>{session ? `${session.layer_count} layers imported. Field configuration API is ready.` : 'Import a project first.'}</p>
          <button onClick={() => setStage(2)} disabled={!session}>Continue</button>
        </section>
      )}

      {stage === 2 && (
        <section>
          <h2>Review And Edit</h2>
          <p>Layer record and edit APIs are ready for the table UI.</p>
          <button onClick={validateSession} disabled={!session}>Validate</button>
        </section>
      )}

      {stage === 3 && (
        <section>
          <h2>Validate</h2>
          {validation && <p>{validation.error_count} errors, {validation.warning_count} warnings.</p>}
          <button onClick={generatePreview} disabled={!validation || !validation.valid}>Generate Preview</button>
        </section>
      )}

      {stage === 4 && (
        <section>
          <h2>Preview And Export</h2>
          <p>{message || 'Generate a preview to continue.'}</p>
          <a href="/preview/" target="_blank" rel="noreferrer">Open Preview</a>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
