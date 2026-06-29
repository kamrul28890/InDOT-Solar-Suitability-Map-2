export const SCORE_SCALE = ['#DBEAFE', '#BFD7FF', '#8CB7F6', '#5B94EA', '#2F6FD3', '#174EA6'];
export const MISSING_SCORE_COLOR = '#2563EB';

function clamp01(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }
  return Math.max(0, Math.min(1, number));
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function scoreToColor(score) {
  const value = clamp01(score);
  if (value === null) {
    return MISSING_SCORE_COLOR;
  }

  if (value === 1) {
    return SCORE_SCALE[SCORE_SCALE.length - 1];
  }

  const scaled = value * (SCORE_SCALE.length - 1);
  const index = Math.floor(scaled);
  const t = scaled - index;
  const start = hexToRgb(SCORE_SCALE[index]);
  const end = hexToRgb(SCORE_SCALE[index + 1]);

  return rgbToHex({
    r: start.r + (end.r - start.r) * t,
    g: start.g + (end.g - start.g) * t,
    b: start.b + (end.b - start.b) * t,
  });
}
