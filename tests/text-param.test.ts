import { describe, expect, it } from 'vitest';
import { cleanText, sanitize, TEXT_MAX_LENGTH } from '../src/sim-core/params';
import { defineSimulation, type ParamDef } from '../src/sim-core/types';
import { decodeState, encodeState } from '../src/sim-core/url-state';

const L = { de: 'x', en: 'x' };
const term: ParamDef = { key: 'term', type: 'text', label: L, default: '3 + 4 · 5', maxLength: 20 };
const defs: ParamDef[] = [term, { key: 'm', type: 'number', label: L, min: 0, max: 5, step: 1, default: 1 }];

describe('Text-Parameter', () => {
  it('übernimmt Text unverändert, entfernt Steuerzeichen und kürzt', () => {
    expect(sanitize(term, '(12 − 4) · 3')).toBe('(12 − 4) · 3');
    expect(sanitize(term, 'a\nb\tc')).toBe('abc');
    expect(sanitize(term, '1234567890123456789012345')).toBe('12345678901234567890');
    expect(sanitize(term, '')).toBe('');
    expect(sanitize(term, 42)).toBe('3 + 4 · 5');
    // Zeichen außerhalb der Basisebene zählen als ein Zeichen
    expect(cleanText('😀'.repeat(30), {})).toBe('😀'.repeat(30));
    expect([...cleanText('x'.repeat(200), {})].length).toBe(TEXT_MAX_LENGTH);
  });

  it('wird in der Adresse gespeichert und wieder gelesen', () => {
    const values = { term: '2 · (x + 1)^2', m: 1 };
    const query = encodeState(defs, values);
    expect(query).toBe('term=2+%C2%B7+%28x+%2B+1%29%5E2');
    expect(decodeState(defs, `?${query}`).values).toEqual(values);
    expect(encodeState(defs, { term: '3 + 4 · 5', m: 1 })).toBe('');
    expect(decodeState(defs, '?term=3*x%2B1').values.term).toBe('3*x+1');
  });
});

describe('Text-Parameter: Typen', () => {
  it('liefert in ctx.params einen String', () => {
    const def = defineSimulation({
      id: 'probe',
      params: [{ key: 'term', type: 'text', label: L, default: '1 + 2' }],
      mount(ctx) {
        const value: string = ctx.params.term;
        return { render: () => void value.length };
      },
    });
    expect(def.params[0].default).toBe('1 + 2');
  });
});
