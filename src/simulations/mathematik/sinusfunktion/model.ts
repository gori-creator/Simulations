/**
 * Rechenlogik der Simulation „Allgemeine Sinusfunktion“:
 * f(x) = a · sin(b(x − c)) + d   bzw.   a · cos(b(x − c)) + d
 */
export type Base = 'sin' | 'cos';

export interface SineParams {
  base: Base;
  a: number;
  b: number;
  c: number;
  d: number;
}

export function evaluate({ base, a, b, c, d }: SineParams, x: number): number {
  const arg = b * (x - c);
  return a * (base === 'sin' ? Math.sin(arg) : Math.cos(arg)) + d;
}

/** Periode p = 2π / b. */
export function period(b: number): number {
  return (2 * Math.PI) / b;
}

/** Wertemenge [d − |a|; d + |a|]. */
export function range({ a, d }: Pick<SineParams, 'a' | 'd'>): [number, number] {
  return [d - Math.abs(a), d + Math.abs(a)];
}

/** x-Wert des ersten Hochpunkts ab der Verschiebung c (für a > 0). */
export function firstPeakOffset(base: Base, b: number): number {
  return base === 'sin' ? period(b) / 4 : 0;
}

/** Eine Verschiebung in Vielfachen von π/12 (für die π-Achse). */
export const PI_TWELFTH = Math.PI / 12;

/** Standardausschnitt der Zeichenfläche. */
export const DEFAULT_VIEW = { x: [-7, 7] as [number, number], y: [-4.2, 4.2] as [number, number] };

/**
 * Ausschnitt für Links und Beispiele: enthält die erste Periode [c; c + p] und
 * die Wertemenge (mit Platz für die Periodenmarke darunter). Passt beides in den
 * Standardausschnitt, bleibt dieser; sonst wird er erweitert bzw. – wenn das zu
 * breit würde – auf die erste Periode ab 0 zugeschnitten (z. B. Modell über 12 Monate).
 */
export function fitView(sp: SineParams, periodBar: boolean): { x: [number, number]; y: [number, number] } {
  const per = period(sp.b);
  const [lo, hi] = range(sp);
  const [dx0, dx1] = DEFAULT_VIEW.x;
  const margin = 1;
  let x: [number, number] = [dx0, dx1];
  if (sp.c < dx0 + 0.3 || sp.c + per > dx1 - 0.3) {
    const union: [number, number] = [Math.min(dx0, sp.c - margin), Math.max(dx1, sp.c + per + margin)];
    if (union[1] - union[0] <= 18) x = union;
    else {
      const x0 = Math.min(0, sp.c) - margin;
      x = [x0, Math.min(Math.max(0, sp.c + per) + margin, x0 + 40)];
    }
  }
  const y: [number, number] = [
    Math.min(DEFAULT_VIEW.y[0], lo - (periodBar ? 1.2 : 0.4)),
    Math.max(DEFAULT_VIEW.y[1], hi + 0.4),
  ];
  return { x, y };
}

// ───────────────────────── Schritt für Schritt ─────────────────────────

/**
 * Parameter nach Schritt k (0 … 4) beim Aufbau aus der Grundfunktion:
 * 0 Grundfunktion, 1 Streckung mit a, 2 Periode über b, 3 Verschiebung c, 4 Verschiebung d.
 * t ∈ [0; 1] blendet weich vom vorigen Schritt zum Schritt k über.
 */
export function stageParams(target: SineParams, k: number, t = 1): SineParams {
  const s = Math.max(0, Math.min(4, Math.round(k)));
  const mix = (from: number, to: number, on: boolean) => (on ? from + (to - from) * t : from);
  const done = (i: number) => s > i; // Schritt i ist schon vollständig
  const a = done(1) ? target.a : mix(1, target.a, s === 1);
  const b = done(2) ? target.b : mix(1, target.b, s === 2);
  const c = done(3) ? target.c : mix(0, target.c, s === 3);
  const d = done(4) ? target.d : mix(0, target.d, s === 4);
  return { base: target.base, a, b, c, d };
}

// ───────────────────────── Kurve treffen ─────────────────────────

/** Zielkurve Nr. q: „schöne“ Werte, Verschiebung in Vielfachen von π/12 (cPi). */
export interface TargetCurve {
  a: number;
  b: number;
  cPi: number;
  d: number;
}

const A_VALUES = [0.5, 1, 1.5, 2, 2.5, 3, -1, -2] as const;
const B_VALUES = [0.5, 1, 1, 2, 2, 3] as const;
const C_VALUES = [-6, -4, -3, -2, 0, 2, 3, 4, 6] as const;
const D_VALUES = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2] as const;

export function targetCurve(q: number, rand: () => number): TargetCurve {
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]!;
  const a = pick(A_VALUES);
  let d = pick(D_VALUES);
  // im Standardausschnitt bleiben (|d| + |a| ≤ 3,5)
  if (Math.abs(d) + Math.abs(a) > 3.5) d = 0;
  // erste Aufgaben einfacher: nur a und d
  const easy = q <= 2;
  return { a, b: easy ? 1 : pick(B_VALUES), cPi: easy ? 0 : pick(C_VALUES), d };
}

/** Größte Abweichung zweier Kurven auf [−2π; 2π] (Abtastung). */
export function maxDifference(p1: SineParams, p2: SineParams, samples = 400): number {
  let m = 0;
  for (let i = 0; i <= samples; i++) {
    const x = -2 * Math.PI + (4 * Math.PI * i) / samples;
    m = Math.max(m, Math.abs(evaluate(p1, x) - evaluate(p2, x)));
  }
  return m;
}
