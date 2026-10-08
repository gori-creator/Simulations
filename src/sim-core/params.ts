import type { NumberParam, ParamDef, ParamValue, ParamValues, TextParam } from './types';

/** Standard-Höchstlänge für Text-Parameter. */
export const TEXT_MAX_LENGTH = 80;

/** Entfernt Steuerzeichen und kürzt auf die Höchstlänge (gezählt in Zeichen, nicht in UTF-16-Einheiten). */
export function cleanText(value: string, def: Pick<TextParam, 'maxLength'>): string {
  const chars = [...value.replace(/[\u0000-\u001f\u007f]/g, '')];
  return chars.slice(0, def.maxLength ?? TEXT_MAX_LENGTH).join('');
}

/** Anzahl der Nachkommastellen einer Schrittweite (0.1 → 1, 0.25 → 2, 1 → 0). */
export function stepDecimals(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 0;
  const text = step.toString();
  if (text.includes('e-')) return Number(text.split('e-')[1]);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Rundet auf das Raster `min + k·step` und begrenzt auf [min, max]. */
export function quantize(value: number, def: Pick<NumberParam, 'min' | 'max' | 'step'>): number {
  if (!Number.isFinite(value)) return def.min;
  const clamped = Math.min(def.max, Math.max(def.min, value));
  const steps = Math.round((clamped - def.min) / def.step);
  const snapped = def.min + steps * def.step;
  const decimals = Math.max(stepDecimals(def.step), stepDecimals(def.min));
  const rounded = Number(snapped.toFixed(decimals));
  return Math.min(def.max, Math.max(def.min, rounded));
}

/** Prüft einen Wert gegen die Definition und liefert einen gültigen Wert zurück. */
export function sanitize(def: ParamDef, value: unknown): ParamValue {
  switch (def.type) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? quantize(n, def) : def.default;
    }
    case 'boolean':
      return typeof value === 'boolean' ? value : def.default;
    case 'choice':
      return def.options.some((o) => o.value === value) ? (value as string) : def.default;
    case 'text':
      return typeof value === 'string' ? cleanText(value, def) : def.default;
  }
}

export function defaultValues(defs: readonly ParamDef[]): ParamValues {
  return Object.fromEntries(defs.map((d) => [d.key, d.default]));
}

export function isVisible(def: ParamDef, values: ParamValues): boolean {
  return def.visibleIf ? def.visibleIf(values) : true;
}

export function valuesEqual(a: ParamValue, b: ParamValue): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-12;
  return a === b;
}
