/**
 * Rechenlogik „Freier Fall“.
 *
 * Ohne Luftwiderstand fallen alle Körper gleich schnell:
 *   s(t) = ½·g·t²,   v(t) = g·t.
 *
 * Mit Luftwiderstand (proportional zu v²) nähert sich die Geschwindigkeit
 * einer Endgeschwindigkeit v_E. Dafür gibt es geschlossene Formeln:
 *   v(t) = v_E · tanh(g·t / v_E),   s(t) = (v_E² / g) · ln cosh(g·t / v_E).
 */

/** Fallbeschleunigung (Ortsfaktor) in m/s². */
export const PLANETS = { erde: 9.81, mond: 1.62, mars: 3.71, jupiter: 24.79 } as const;
export type PlanetId = keyof typeof PLANETS;

/** Fallstrecke nach der Zeit t (aus der Ruhe, ohne Luftwiderstand). */
export function fallDistance(g: number, t: number): number {
  return 0.5 * g * t * t;
}

/** Geschwindigkeit nach der Zeit t (aus der Ruhe, ohne Luftwiderstand). */
export function fallSpeed(g: number, t: number): number {
  return g * t;
}

/** Fallzeit für die Höhe h: t = √(2h/g). */
export function fallTime(h: number, g: number): number {
  return Math.sqrt((2 * h) / g);
}

/** Aufprallgeschwindigkeit nach der Höhe h: v = √(2·g·h). */
export function impactSpeed(h: number, g: number): number {
  return Math.sqrt(2 * g * h);
}

/**
 * Abstände zwischen aufeinanderfolgenden Stroboskop-Bildern (Blitzabstand Δt):
 * Δs_k = ½·g·Δt²·(2k − 1) – sie verhalten sich wie 1 : 3 : 5 : 7 : …
 */
export function strobeGaps(g: number, dt: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => 0.5 * g * dt * dt * (2 * i + 1));
}

/** ln(cosh u), auch für große u ohne Überlauf. */
function lnCosh(u: number): number {
  const a = Math.abs(u);
  return a + Math.log1p(Math.exp(-2 * a)) - Math.LN2;
}

/** Fallstrecke mit Luftwiderstand (Endgeschwindigkeit vEnd in m/s). */
export function dragDistance(g: number, vEnd: number, t: number): number {
  if (!Number.isFinite(vEnd)) return fallDistance(g, t);
  return ((vEnd * vEnd) / g) * lnCosh((g * t) / vEnd);
}

/** Geschwindigkeit mit Luftwiderstand. */
export function dragSpeed(g: number, vEnd: number, t: number): number {
  if (!Number.isFinite(vEnd)) return fallSpeed(g, t);
  return vEnd * Math.tanh((g * t) / vEnd);
}

/** Fallzeit für die Höhe h mit Luftwiderstand: t = (v_E/g) · arcosh(exp(g·h/v_E²)). */
export function dragFallTime(h: number, g: number, vEnd: number): number {
  if (!Number.isFinite(vEnd)) return fallTime(h, g);
  const x = (g * h) / (vEnd * vEnd);
  // arcosh(eˣ) = x + ln(1 + √(1 − e^(−2x))) – numerisch stabil
  return (vEnd / g) * (x + Math.log1p(Math.sqrt(-Math.expm1(-2 * x))));
}

/**
 * Endgeschwindigkeiten in Luft (Näherungswerte): Stahlkugel (Ø 3 cm) und
 * Vogelfeder. Im Vakuum gibt es keine Endgeschwindigkeit (∞).
 */
export const TERMINAL = { ball: 75, feather: 0.6 } as const;

/** Reaktionszeit aus der Fallstrecke des Lineals: t = √(2s/g). */
export function reactionTime(s: number, g: number): number {
  return Math.sqrt((2 * Math.max(0, s)) / g);
}

/** Mittelwert, kleinster und größter Wert einer Messreihe. */
export function stats(values: readonly number[]): { mean: number; min: number; max: number } | null {
  if (!values.length) return null;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    sum += v;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return { mean: sum / values.length, min, max };
}
