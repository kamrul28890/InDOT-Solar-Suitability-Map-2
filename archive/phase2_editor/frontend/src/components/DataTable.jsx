import { useState } from 'react';
import { RotateCcw, Save, Undo2 } from 'lucide-react';

export function DataTable({ layerData, selectedRecord, onSelectRecord, onSaveCell, onRevertField, onRevertRow, onUndo }) {
  // Only one cell enters draft mode at a time. Persisted table values continue
  // to come from the parent after backend validation and reload.
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const fields = layerData?.fields || [];
  const records = layerData?.records || [];

  function beginEdit(record, field) {
    // Preserve valid zero/false values; only null or undefined displays blank.
    setEditing({ featureId: record.feature_id, field: field.code });
    setDraft(record.values[field.code] ?? '');
  }

  function cancelEdit() {
    setEditing(null);
    setDraft('');
  }

  async function commitEdit() {
    // Wait for backend persistence before clearing the local draft.
    if (!editing) return;
    await onSaveCell(editing.featureId, editing.field, draft);
    cancelEdit();
  }

  return (
    <section className="table-panel">
      <div className="table-header">
        <div>
          <h2>Review and Edit</h2>
          <p className="hint">
            {layerData?.total || 0} rows, {layerData?.edited_cells || 0} edited cells, {layerData?.error_count || 0} validation errors
          </p>
        </div>
        <button className="secondary-button" onClick={onUndo} title="Undo most recent edit">
          <Undo2 size={16} />
          Undo
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Feature ID</th>
              {fields.map((field) => (
                <th key={field.code}>{field.label}</th>
              ))}
              <th>Row</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                className={selectedRecord?.feature_id === record.feature_id ? 'is-selected' : ''}
                key={record.feature_id}
                onClick={() => onSelectRecord(record)}
              >
                <td>{record.feature_id}</td>
                {fields.map((field) => {
                  // A cell can independently represent an edit, an error, or a
                  // warning; CSS combines those states for review visibility.
                  const isEditing = editing?.featureId === record.feature_id && editing?.field === field.code;
                  const edit = record.edits[field.code];
                  const error = record.validation.errors[field.code];
                  const warning = record.validation.warnings[field.code];
                  return (
                    <td
                      className={[edit ? 'is-edited' : '', error ? 'is-invalid' : '', warning ? 'is-warning' : ''].filter(Boolean).join(' ')}
                      key={field.code}
                      title={edit ? `Original: ${edit.original} | Edited: ${edit.edited}` : error || warning || ''}
                    >
                      {isEditing ? (
                        <div className="cell-editor">
                          <input
                            autoFocus
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              // Keyboard commit/cancel speeds review of wide
                              // engineering attribute tables.
                              if (event.key === 'Enter') commitEdit();
                              if (event.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button className="icon-button" onClick={commitEdit}>
                            <Save size={14} />
                          </button>
                        </div>
                      ) : (
                        <button className="cell-button" onClick={() => beginEdit(record, field)}>
                          {record.values[field.code] ?? ''}
                        </button>
                      )}
                      {edit ? (
                        <button className="mini-action" onClick={() => onRevertField(record.feature_id, field.code)} title="Revert this cell">
                          <RotateCcw size={12} />
                        </button>
                      ) : null}
                    </td>
                  );
                })}
                <td>
                  <button className="secondary-button compact" onClick={() => onRevertRow(record.feature_id)}>
                    Revert row
                  </button>
                </td>
              </tr>
            ))}
            {!records.length ? (
              <tr>
                <td colSpan={fields.length + 2}>No records match the current filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
