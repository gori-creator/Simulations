/** Rechenlogik „Von der Sekante zur Tangente“. */
export type FunctionId = 'x2' | 'cubic' | 'sin' | 'exp';

export interface FunctionDef {
  f: (x: number) => number;
  df: (x: number) => number;
  /** Funktionsterm als Text (für Anzeigen). */
  term: string;
  /** Ableitungsterm als Text. */
  derivative: string;
}

export const FUNCTIONS: Record<FunctionId, FunctionDef> = {
  x2: { f: (x) => x * x, df: (x) => 2 * x, term: 'x²', derivative: '2x' },
  cubic: { f: (x) => 0.25 * x ** 3 - x, df: (x) => 0.75 * x * x - 1, term: '0,25x³ − x', derivative: '0,75x² − 1' },
  sin: { f: Math.sin, df: Math.cos, term: 'sin x', derivative: 'cos x' },
  exp: { f: Math.exp, df: Math.exp, term: 'eˣ', derivative: 'eˣ' },
};

/** Differenzenquotient (f(x₀ + h) − f(x₀)) / h. */
export function differenceQuotient(f: (x: number) => number, x0: number, h: number): number {
  return (f(x0 + h) - f(x0)) / h;
}
