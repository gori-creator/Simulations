/** Rechenlogik „Integral als Flächenbilanz (Rechtecksummen)“. */

export type SumKind = 'lower' | 'upper' | 'left' | 'right' | 'mid' | 'trapez';
export type FunctionId = 'x2' | 'sqrt' | 'sin' | 'cubic' | 'exp';

export interface FunctionDef {
  f: (x: number) => number;
  /** Stammfunktion für den exakten Wert. */
  F: (x: number) => number;
  term: string;
  /** Definitionsbereich (für √x nur x ≥ 0). */
  domain: [number, number];
  /**
   * Stellen mit f′(x) = 0 im offenen Intervall ]x0; x1[ (analytisch). Zusammen
   * mit den Rändern liefern sie das exakte Minimum und Maximum im Streifen.
   */
  critical: (x0: number, x1: number) => number[];
}

/** Alle Werte aus `list`, die echt zwischen x0 und x1 liegen. */
function inside(list: readonly number[], x0: number, x1: number): number[] {
  return list.filter((x) => x > x0 && x < x1);
}

/** Nullstellen von cos x (Extremstellen von sin x) in ]x0; x1[: π/2 + kπ. */
function sinCritical(x0: number, x1: number): number[] {
  const out: number[] = [];
  for (let k = Math.ceil((x0 - Math.PI / 2) / Math.PI); Math.PI / 2 + k * Math.PI < x1; k++) {
    const x = Math.PI / 2 + k * Math.PI;
    if (x > x0) out.push(x);
  }
  return out;
}

/** f′(x) = 1,5x² − 2 = 0 ⇔ x = ±√(4/3). */
const CUBIC_CRIT = [-Math.sqrt(4 / 3), Math.sqrt(4 / 3)];

export const FUNCTIONS: Record<FunctionId, FunctionDef> = {
  x2: { f: (x) => x * x, F: (x) => (x * x * x) / 3, term: 'x²', domain: [-5, 5], critical: (x0, x1) => inside([0], x0, x1) },
  sqrt: { f: (x) => Math.sqrt(Math.max(0, x)), F: (x) => (2 / 3) * Math.max(0, x) ** 1.5, term: '√x', domain: [0, 9], critical: () => [] },
  sin: { f: Math.sin, F: (x) => -Math.cos(x), term: 'sin x', domain: [-7, 7], critical: sinCritical },
  cubic: { f: (x) => 0.5 * x ** 3 - 2 * x, F: (x) => 0.125 * x ** 4 - x * x, term: '0,5x³ − 2x', domain: [-4, 4], critical: (x0, x1) => inside(CUBIC_CRIT, x0, x1) },
  exp: { f: (x) => Math.exp(x / 2), F: (x) => 2 * Math.exp(x / 2), term: 'e^(x/2)', domain: [-4, 4], critical: () => [] },
};

export function exactIntegral(def: FunctionDef, a: number, b: number): number {
  return def.F(b) - def.F(a);
}

export interface Strip {
  x0: number;
  x1: number;
  /** Höhe des Rechtecks (bei Trapezen: linke und rechte Höhe). */
  h0: number;
  h1: number;
}

/** Stellen mit f′ = 0 in ]x0; x1[; fehlt die Angabe, wird numerisch gesucht. */
export type CriticalFn = (x0: number, x1: number) => number[];

/**
 * Kleinster bzw. größter Funktionswert auf [x0, x1]: Ränder und Stellen mit
 * f′ = 0. Ohne `critical` (beliebige Funktion) wird abgetastet und um den
 * besten Abtastwert per Intervallschachtelung (Goldener Schnitt) nachgebessert.
 */
export function extremes(f: (x: number) => number, x0: number, x1: number, critical?: CriticalFn): { min: number; max: number } {
  if (critical) {
    const values = [x0, x1, ...critical(x0, x1)].map(f);
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  const samples = 32;
  const step = (x1 - x0) / samples;
  let iMin = 0;
  let iMax = 0;
  const ys: number[] = [];
  for (let i = 0; i <= samples; i++) {
    ys.push(f(x0 + step * i));
    if (ys[i]! < ys[iMin]!) iMin = i;
    if (ys[i]! > ys[iMax]!) iMax = i;
  }
  const refine = (i: number, sign: 1 | -1): number => {
    let l = x0 + step * Math.max(0, i - 1);
    let r = x0 + step * Math.min(samples, i + 1);
    const g = (Math.sqrt(5) - 1) / 2;
    for (let k = 0; k < 60; k++) {
      const m1 = r - g * (r - l);
      const m2 = l + g * (r - l);
      if (sign * f(m1) < sign * f(m2)) r = m2;
      else l = m1;
    }
    return f((l + r) / 2);
  };
  return { min: Math.min(ys[iMin]!, refine(iMin, 1)), max: Math.max(ys[iMax]!, refine(iMax, -1)) };
}

/** Streifen der Rechteck- bzw. Trapezsumme mit n gleich breiten Teilintervallen. */
export function strips(f: (x: number) => number, a: number, b: number, n: number, kind: SumKind, critical?: CriticalFn): Strip[] {
  const w = (b - a) / n;
  return Array.from({ length: n }, (_, i) => {
    const x0 = a + i * w;
    const x1 = x0 + w;
    let h: number;
    switch (kind) {
      case 'lower':
        h = extremes(f, x0, x1, critical).min;
        break;
      case 'upper':
        h = extremes(f, x0, x1, critical).max;
        break;
      case 'left':
        h = f(x0);
        break;
      case 'right':
        h = f(x1);
        break;
      case 'mid':
        h = f((x0 + x1) / 2);
        break;
      case 'trapez':
        return { x0, x1, h0: f(x0), h1: f(x1) };
    }
    return { x0, x1, h0: h, h1: h };
  });
}

/** Wert der Summe (Flächenbilanz: Flächen unter der x-Achse zählen negativ). */
export function sumOf(list: readonly Strip[]): number {
  return list.reduce((s, r) => s + ((r.h0 + r.h1) / 2) * (r.x1 - r.x0), 0);
}
