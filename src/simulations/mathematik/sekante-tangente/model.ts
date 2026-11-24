/** Rechenlogik „Von der Sekante zur Tangente“. */
export type FunctionId = 'x2' | 'cubic' | 'sin' | 'exp' | 'abs' | 'car';

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
  // Spielzeugauto, das eine Rampe hinunter gleichmäßig schneller wird: Weg s(t) = 0,1t² + 0,2t in m, v(t) = 0,2t + 0,2 in m/s
  car: { f: (t) => 0.1 * t * t + 0.2 * t, df: (t) => 0.2 * t + 0.2, term: '0,1t² + 0,2t', derivative: '0,2t + 0,2' },
};

// ───────────────────────── Lupe ─────────────────────────

/** Größte Abweichung zwischen Graph und Tangente im Fenster [x₀ − w; x₀ + w]. */
export function tangentGap(def: FunctionDef, x0: number, w: number, samples = 100): number {
  const m = def.df(x0);
  const y0 = def.f(x0);
  let gap = 0;
  for (let i = 0; i <= samples; i++) {
    const x = x0 - w + (2 * w * i) / samples;
    gap = Math.max(gap, Math.abs(def.f(x) - (y0 + m * (x - x0))));
  }
  return gap;
}

// ───────────────────────── Spiel: Tangente anlegen ─────────────────────────

export interface FitTask {
  fn: Exclude<FunctionId, 'abs' | 'car'>;
  x0: number;
}

const FIT_POINTS: Record<FitTask['fn'], readonly number[]> = {
  x2: [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2],
  cubic: [-3, -2, -1, 0, 1, 2, 3],
  sin: [0, 0.5, 1, 2, 2.5, 3, 4, 5, 6],
  exp: [-2, -1, -0.5, 0, 0.5, 1, 1.5],
};

/** Reproduzierbare Aufgabe: Funktion und Stelle, an der die Tangente angelegt werden soll. */
export function fitTask(rand: () => number): FitTask {
  const fns = ['x2', 'cubic', 'sin', 'exp'] as const;
  const fn = fns[Math.floor(rand() * fns.length)]!;
  const pts = FIT_POINTS[fn];
  return { fn, x0: pts[Math.floor(rand() * pts.length)]! };
}

/** Bewertung der geschätzten Steigung: Winkelabweichung in Grad (gleich steil aussehend = fair für steile Stellen). */
export function slopeAngleError(estimate: number, exact: number): number {
  return Math.abs(Math.atan(estimate) - Math.atan(exact)) * (180 / Math.PI);
}

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
