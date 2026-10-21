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
