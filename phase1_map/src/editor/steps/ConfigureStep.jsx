export function ConfigureStep({ layers, onLayerChange }) {
  function update(layer, patch) {
    onLayerChange(layer.name, (current) => ({ ...current, ...patch }));
  }

  function updateFieldList(layer, key, fieldName, checked) {
    const existing = layer[key] || [];
    const has = existing.some((item) => item.field === fieldName);
    if (checked && !has) {
      const field = layer.fields.find((item) => item.name === fieldName);
      update(layer, { [key]: [...existing, { field: fieldName, label: fieldName.replace(/_/g, ' '), type: field?.type || 'text' }] });
    } else if (!checked) {
      update(layer, { [key]: existing.filter((item) => item.field !== fieldName) });
    }
  }

  return (
    <section className="editor-panel">
      <h2>Configure layers</h2>
      <div className="configure-list">
        {layers.map((layer) => (
          <article className="configure-card" key={layer.name}>
            <div className="configure-grid">
              <label>
                Title
                <input value={layer.title} onChange={(event) => update(layer, { title: event.target.value })} />
              </label>
              <label>
                Color
                <input type="color" value={layer.color} onChange={(event) => update(layer, { color: event.target.value })} />
              </label>
              <label>
                Label field
                <select value={layer.label_field} onChange={(event) => update(layer, { label_field: event.target.value })}>
                  <option value="">Auto</option>
                  {layer.fields.map((field) => <option key={field.name} value={field.name}>{field.name}</option>)}
                </select>
              </label>
              <label>
                Group field
                <select value={layer.subgroup_field} onChange={(event) => update(layer, { subgroup_field: event.target.value })}>
                  <option value="">None</option>
                  {layer.fields.map((field) => <option key={field.name} value={field.name}>{field.name}</option>)}
                </select>
              </label>
              <label>
                Score color field
                <select value={layer.score_color_field || ''} onChange={(event) => update(layer, { score_color_field: event.target.value || null })}>
                  <option value="">None</option>
                  {layer.fields.filter((field) => field.type === 'number').map((field) => <option key={field.name} value={field.name}>{field.name}</option>)}
                </select>
              </label>
            </div>
            <div className="field-pickers">
              <FieldPicker
                fields={layer.fields}
                selected={layer.popup_fields}
                title="Popup fields"
                onToggle={(field, checked) => updateFieldList(layer, 'popup_fields', field, checked)}
              />
              <FieldPicker
                fields={layer.fields.filter((field) => field.type === 'number')}
                selected={layer.score_fields}
                title="Score fields"
                onToggle={(field, checked) => updateFieldList(layer, 'score_fields', field, checked)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FieldPicker({ fields, selected, title, onToggle }) {
  const selectedFields = new Set((selected || []).map((item) => item.field));
  return (
    <div className="field-picker">
      <h3>{title}</h3>
      {fields.map((field) => (
        <label key={field.name}>
          <input
            type="checkbox"
            checked={selectedFields.has(field.name)}
            onChange={(event) => onToggle(field.name, event.target.checked)}
          />
          {field.name}
        </label>
      ))}
    </div>
  );
}
