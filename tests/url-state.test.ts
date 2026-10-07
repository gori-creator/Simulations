import { describe, expect, it } from 'vitest';
import { quantize, stepDecimals } from '../src/sim-core/params';
import type { ParamDef } from '../src/sim-core/types';
import { decodeState, encodeState } from '../src/sim-core/url-state';

const L = { de: 'x', en: 'x' };
const defs: ParamDef[] = [
  { key: 'm', type: 'number', label: L, min: -5, max: 5, step: 0.1, default: 0.5 },
  { key: 'show', type: 'boolean', label: L, default: true },
  {
    key: 'form',
    type: 'choice',
    label: L,
    options: [
      { value: 'a', label: L },
      { value: 'b', label: L },
    ],
    default: 'a',
  },
  { key: 'k', type: 'number', label: L, min: 0, max: 10, step: 1, default: 3, visibleIf: (v) => v.form === 'b' },
];

describe('quantize', () => {
  it('rundet auf das Raster und begrenzt', () => {
    expect(quantize(0.123, { min: -5, max: 5, step: 0.1 })).toBe(0.1);
    expect(quantize(0.15000001, { min: -5, max: 5, step: 0.1 })).toBe(0.2);
    expect(quantize(99, { min: -5, max: 5, step: 0.1 })).toBe(5);
    expect(quantize(-2.25, { min: -24, max: 24, step: 1 })).toBe(-2);
    expect(quantize(0.3, { min: 0.1, max: 4, step: 0.01 })).toBe(0.3);
  });

  it('kennt die Nachkommastellen einer Schrittweite', () => {
    expect(stepDecimals(1)).toBe(0);
    expect(stepDecimals(0.1)).toBe(1);
    expect(stepDecimals(0.05)).toBe(2);
    expect(stepDecimals(1e-7)).toBe(7);
  });
});

describe('URL-Zustand', () => {
  it('speichert nur Abweichungen vom Standard', () => {
    const values = { m: 0.5, show: true, form: 'a', k: 3 };
    expect(encodeState(defs, values)).toBe('');
    expect(encodeState(defs, { ...values, m: -1.5, show: false })).toBe('m=-1.5&show=0');
  });

  it('lässt ausgeblendete Parameter weg', () => {
    expect(encodeState(defs, { m: 0.5, show: true, form: 'a', k: 7 })).toBe('');
    expect(encodeState(defs, { m: 0.5, show: true, form: 'b', k: 7 })).toBe('form=b&k=7');
  });

  it('hängt Steuerparameter an', () => {
    expect(encodeState(defs, { m: 1, show: true, form: 'a', k: 3 }, { lock: true, hide: true })).toBe('m=1&_lock=1&_hide=1');
  });

  it('liest Werte robust ein (Komma, ungültige Werte, unbekannte Schlüssel)', () => {
    const { values, flags } = decodeState(defs, '?m=2,5&show=0&form=zzz&k=abc&foo=1&_lock=1');
    expect(values).toEqual({ m: 2.5, show: false, form: 'a', k: 3 });
    expect(flags).toEqual({ lock: true, hide: false });
  });

  it('begrenzt Werte aus dem Link auf den erlaubten Bereich', () => {
    expect(decodeState(defs, 'm=1000').values.m).toBe(5);
  });

  it('übersteht einen Hin- und Rückweg', () => {
    const values = { m: -3.7, show: false, form: 'b', k: 9 };
    const query = encodeState(defs, values, { lock: false, hide: true });
    const decoded = decodeState(defs, query);
    expect(decoded.values).toEqual(values);
    expect(decoded.flags).toEqual({ lock: false, hide: true });
  });
});
