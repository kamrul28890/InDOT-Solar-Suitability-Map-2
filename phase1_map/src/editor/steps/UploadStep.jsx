import { useState } from 'react';

import { parseShapefiles } from '../lib/parseShapefiles';

export function UploadStep({ onLoaded }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleFiles(files) {
    setBusy(true);
    setError('');
    try {
      const parsed = await parseShapefiles(files);
      await onLoaded(parsed.layers);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="editor-panel upload-panel"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
    >
      <h2>Upload shapefiles</h2>
      <p>Drop a shapefile ZIP or loose `.shp`, `.dbf`, `.shx`, and `.prj` components. All processing stays in this browser.</p>
      <label className="file-picker">
        Select files
        <input
          multiple
          type="file"
          accept=".zip,.shp,.dbf,.shx,.prj,.cpg"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {busy ? <p className="status-message">Reading shapefile data...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
    </section>
  );
}
