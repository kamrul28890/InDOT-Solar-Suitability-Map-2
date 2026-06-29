import { describe, expect, it } from 'vitest';

import { resolveLayerDisplay, resolveLabelField, resolvePopupFields } from './displayDefaults';

describe('display defaults', () => {
  it('uses blue legacy layer colors and score fallback', () => {
    const display = resolveLayerDisplay({ name: 'facility_scored' });
    expect(display.color).toBe('#1d4ed8');
    expect(display.score_fields.map((field) => field.field)).toContain('sol_s');
    expect(resolveLabelField({ name: 'facility_scored' })).toBe('Unit_Site');
  });

  it('prefers manifest display settings', () => {
    const layer = {
      name: 'custom',
      color: '#123456',
      label_field: 'Title',
      popup_fields: [{ field: 'Title', label: 'Title', type: 'text' }],
    };
    expect(resolveLayerDisplay(layer).color).toBe('#123456');
    expect(resolveLabelField(layer)).toBe('Title');
    expect(resolvePopupFields(layer)).toEqual(layer.popup_fields);
  });
});
