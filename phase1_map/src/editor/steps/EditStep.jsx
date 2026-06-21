import { useMemo, useState } from 'react';

export function EditStep({ layers, onCellChange }) {
  const [activeLayer, setActiveLayer] = useState(layers[0]?.name || '');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const layer = layers.find((item) => item.name === activeLayer) || layers[0];
  const fields = layer?.fields || [];
  const records = useMemo(() => {
    const text = query.trim().toLowerCase();
    const all = layer?.geojson.features || [];
    return text
      ? all.filter((feature) => JSON.stringify(feature.properties || {}).toLowerCase().includes(text))
      : all;
  }, [layer, query]);
  const pageSize = 25;
  const pageRecords = records.slice(page * pageSize, page * pageSize + pageSize);

  if (!layer) {
    return null;
  }

  return (
    <section className="editor-panel">
      <div className="table-header">
        <div>
          <h2>Edit attributes</h2>
          <p className="hint">{records.length} rows in {layer.title}</p>
        </div>
        <select value={activeLayer} onChange={(event) => { setActiveLayer(event.target.value); setPage(0); }}>
          {layers.map((item) => <option key={item.name} value={item.name}>{item.title}</option>)}
        </select>
      </div>
      <input className="editor-search" placeholder="Search records" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Feature ID</th>
              {fields.map((field) => <th key={field.name}>{field.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageRecords.map((feature) => (
              <tr key={feature.properties.feature_id}>
                <td>{feature.properties.feature_id}</td>
                {fields.map((field) => (
                  <td key={field.name}>
                    <input
                      value={feature.properties[field.name] ?? ''}
                      onChange={(event) => onCellChange(layer.name, feature.properties.feature_id, field.name, event.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
        <span>Page {page + 1} of {Math.max(1, Math.ceil(records.length / pageSize))}</span>
        <button
          type="button"
          disabled={(page + 1) * pageSize >= records.length}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
