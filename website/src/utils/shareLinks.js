const ALLOWED_KEYS = new Set(['site', 'color', 'district', 'type', 'voltage', 'flood', 'view']);

function cleanState(state = {}) {
  return Object.fromEntries(
    Object.entries(state).filter((entry) => ALLOWED_KEYS.has(entry[0]) && entry[1] !== null && entry[1] !== undefined && entry[1] !== '')
  );
}

export function buildShareLink(state = {}, route = '/map') {
  const params = new URLSearchParams(cleanState(state));
  const query = params.toString();
  return `#${route}${query ? `?${query}` : ''}`;
}

export function parseMapState(hash = '') {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  const query = normalized.includes('?') ? normalized.slice(normalized.indexOf('?') + 1) : normalized;
  const params = new URLSearchParams(query);
  return Object.fromEntries([...params.entries()].filter(([key]) => ALLOWED_KEYS.has(key)));
}
