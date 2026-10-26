/** Rechenlogik „Von der Sekante zur Tangente“. */
export type FunctionId = 'x2' | 'cubic' | 'sin' | 'exp' | 'abs';

export interface FunctionDef {
  f: (x: number) => number;
  /** Ableitung; an Knickstellen NaN (dort nicht differenzierbar). */
  df: (x: number) => number;
  /** Funktionsterm als Text (für Anzeigen). */
  term: string;
  /** Ableitungsterm als Text. */
  derivative: string;
  /** Stellen, an denen f nicht differenzierbar ist (Knick). */
  kinks?: number[];
}

export const FUNCTIONS: Record<FunctionId, FunctionDef> = {
  x2: { f: (x) => x * x, df: (x) => 2 * x, term: 'x²', derivative: '2x' },
  cubic: { f: (x) => 0.25 * x ** 3 - x, df: (x) => 0.75 * x * x - 1, term: '0,25x³ − x', derivative: '0,75x² − 1' },
  sin: { f: Math.sin, df: Math.cos, term: 'sin x', derivative: 'cos x' },
  exp: { f: Math.exp, df: Math.exp, term: 'eˣ', derivative: 'eˣ' },
  // Betragsfunktion: Knick bei 0, links Steigung −1, rechts +1
  abs: { f: Math.abs, df: (x) => (x === 0 ? NaN : Math.sign(x)), term: '|x|', derivative: '−1 (x < 0), 1 (x > 0)', kinks: [0] },
};

/** Differenzenquotient (f(x₀ + h) − f(x₀)) / h; für h = 0 nicht definiert (NaN). */
export function differenceQuotient(f: (x: number) => number, x0: number, h: number): number {
  if (h === 0) return NaN;
  return (f(x0 + h) - f(x0)) / h;
}

/** Ist f an der Stelle x₀ differenzierbar (kein Knick)? */
export function isDifferentiable(def: FunctionDef, x0: number): boolean {
  return Number.isFinite(def.df(x0));
}

/** Rundet auf d Nachkommastellen. */
export function roundTo(v: number, d: number): number {
  const k = 10 ** d;
  return Math.round(v * k) / k;
}

/** Ist v auf d Nachkommastellen exakt darstellbar (dann „=“, sonst „≈“)? */
export function isExactAt(v: number, d: number): boolean {
  return Math.abs(v - roundTo(v, d)) < 1e-9 * Math.max(1, Math.abs(v));
}
