/**
 * Lektion „Zeichen erkennen“: Zeichnungen aus 5 × 5 Kästchen. Bit vergleicht
 * eine neue Zeichnung mit allen Beispielen und nimmt das ähnlichste
 * (Abstand = Zahl der Kästchen, die sich unterscheiden).
 */
export const GRID = 5;
export type Symbol = 'cross' | 'circle' | 'line';
export const SYMBOLS: Symbol[] = ['cross', 'circle', 'line'];

export interface Drawing {
  cells: number[];
  label: Symbol;
}

const parse = (rows: string[]): number[] => rows.join('').split('').map(Number);

/** Saubere Vorlagen (für „Vorlage laden“). */
export const TEMPLATES: Record<Symbol, number[]> = {
  cross: parse(['10001', '01010', '00100', '01010', '10001']),
  circle: parse(['01110', '10001', '10001', '10001', '01110']),
  line: parse(['00100', '00100', '00100', '00100', '00100']),
};

/** Bits Probe: etwas verwackelte Zeichnungen. */
export const TEST_DRAWINGS: Drawing[] = [
  { label: 'cross', cells: parse(['10001', '01010', '00100', '01010', '10000']) },
  { label: 'circle', cells: parse(['01110', '10001', '10001', '10011', '01110']) },
  { label: 'line', cells: parse(['00100', '00100', '00100', '01000', '01000']) },
  { label: 'cross', cells: parse(['00001', '01010', '00100', '01010', '10001']) },
  { label: 'circle', cells: parse(['11110', '10001', '10001', '10001', '01111']) },
  { label: 'line', cells: parse(['00010', '00100', '00100', '00100', '00100']) },
];

export function distance(a: readonly number[], b: readonly number[]): number {
  return a.reduce((n, v, i) => n + (v === b[i] ? 0 : 1), 0);
}

/** Ähnlichstes Beispiel; ohne Beispiele null. Bei Gleichstand gewinnt das früher gezeigte. */
export function recognise(cells: readonly number[], examples: readonly Drawing[]): { label: Symbol; distance: number } | null {
  let best: { label: Symbol; distance: number } | null = null;
  for (const e of examples) {
    const d = distance(cells, e.cells);
    if (!best || d < best.distance) best = { label: e.label, distance: d };
  }
  return best;
}
