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
}

export const FUNCTIONS: Record<FunctionId, FunctionDef> = {
  x2: { f: (x) => x * x, F: (x) => (x * x * x) / 3, term: 'x²', domain: [-5, 5] },
  sqrt: { f: (x) => Math.sqrt(Math.max(0, x)), F: (x) => (2 / 3) * Math.max(0, x) ** 1.5, term: '√x', domain: [0, 9] },
  sin: { f: Math.sin, F: (x) => -Math.cos(x), term: 'sin x', domain: [-7, 7] },
  cubic: { f: (x) => 0.5 * x ** 3 - 2 * x, F: (x) => 0.125 * x ** 4 - x * x, term: '0,5x³ − 2x', domain: [-4, 4] },
  exp: { f: (x) => Math.exp(x / 2), F: (x) => 2 * Math.exp(x / 2), term: 'e^(x/2)', domain: [-4, 4] },
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

/** Kleinster bzw. größter Funktionswert auf [x0, x1] (dichte Abtastung). */
function extremes(f: (x: number) => number, x0: number, x1: number, samples = 32): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const v = f(x0 + ((x1 - x0) * i) / samples);
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

/** Streifen der Rechteck- bzw. Trapezsumme mit n gleich breiten Teilintervallen. */
export function strips(f: (x: number) => number, a: number, b: number, n: number, kind: SumKind): Strip[] {
  const w = (b - a) / n;
  return Array.from({ length: n }, (_, i) => {
    const x0 = a + i * w;
    const x1 = x0 + w;
    let h: number;
    switch (kind) {
      case 'lower':
        h = extremes(f, x0, x1).min;
        break;
      case 'upper':
        h = extremes(f, x0, x1).max;
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
