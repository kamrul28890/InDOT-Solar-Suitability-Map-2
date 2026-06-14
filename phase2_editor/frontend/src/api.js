const API_BASE = 'http://127.0.0.1:8010';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const detail = payload.detail || payload;
    throw new Error(Array.isArray(detail) ? detail.join(' ') : typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return payload;
}

export function browseFolder() {
  return request('/api/browse-folder', { method: 'POST' });
}

export function autosaveStatus() {
  return request('/api/autosave');
}

export function resumeAutosave() {
  return request('/api/autosave/resume', { method: 'POST' });
}

export function importFolder(folderPath) {
  return request('/api/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder_path: folderPath }),
  });
}

export function loadSession(sessionId) {
  return request(`/api/session/${sessionId}`);
}

export function loadFields(sessionId) {
  return request(`/api/fields/${sessionId}`);
}

export function saveLayerFields(sessionId, layerName, fields) {
  return request(`/api/fields/${sessionId}/${layerName}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
}

export function resetFields(sessionId) {
  return request(`/api/fields/${sessionId}/reset`, { method: 'POST' });
}

export function loadLayerRecords(sessionId, layerName, filters = {}) {
  const params = new URLSearchParams({
    query: filters.query || '',
    edited_only: filters.editedOnly ? 'true' : 'false',
    errors_only: filters.errorsOnly ? 'true' : 'false',
  });
  return request(`/api/layers/${sessionId}/${layerName}?${params}`);
}

export function patchCell(sessionId, layerName, featureId, fieldCode, value) {
  return request(`/api/layers/${sessionId}/${layerName}/${featureId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field_code: fieldCode, value }),
  });
}

export function revertFeature(sessionId, layerName, featureId) {
  return request(`/api/layers/${sessionId}/${layerName}/${featureId}/edits`, { method: 'DELETE' });
}

export function revertField(sessionId, layerName, featureId, fieldCode) {
  return request(`/api/layers/${sessionId}/${layerName}/${featureId}/edits/${fieldCode}`, { method: 'DELETE' });
}

export function undo(sessionId) {
  return request(`/api/session/${sessionId}/undo`, { method: 'POST' });
}

export function validateSession(sessionId) {
  return request(`/api/validate/${sessionId}`, { method: 'POST' });
}

export function generatePreview(sessionId) {
  return request(`/api/preview/generate/${sessionId}`, { method: 'POST' });
}

export function exportZip(sessionId) {
  return request(`/api/export/${sessionId}`, { method: 'POST' });
}

export function fullUrl(path) {
  return `${API_BASE}${path}`;
}
