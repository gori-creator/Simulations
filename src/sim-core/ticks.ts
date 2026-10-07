/**
 * Achseneinteilung: „schöne“ Schrittweiten (1, 2, 5 · 10ⁿ) oder Vielfache von π.
 */

/** Kleinste schöne Schrittweite ≥ `raw`. */
export function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exponent = Math.floor(Math.log10(raw));
  const base = 10 ** exponent;
  const mantissa = raw / base;
  const nice = mantissa <= 1 ? 1 : mantissa <= 2 ? 2 : mantissa <= 5 ? 5 : 10;
  return nice * base;
}

/** Feinere Unterteilung für das Gitter (z. B. 2 → 1, 5 → 1, 1 → 0,5). */
export function minorStep(step: number): number {
  const exponent = Math.floor(Math.log10(step) + 1e-9);
  const mantissa = Math.round(step / 10 ** exponent);
  return mantissa === 2 ? step / 2 : mantissa === 5 ? step / 5 : step / 2;
}

/** Alle Vielfachen von `step` im Intervall [min, max]. */
export function ticksIn(min: number, max: number, step: number): number[] {
  if (!(step > 0) || !Number.isFinite(min) || !Number.isFinite(max) || max < min) return [];
  const first = Math.ceil(min / step - 1e-9);
  const last = Math.floor(max / step + 1e-9);
  const result: number[] = [];
  if (last - first > 2000) return result;
  for (let k = first; k <= last; k++) result.push(Number((k * step).toPrecision(12)));
  return result;
}

/** Schrittweiten für π-Achsen (als Vielfache von π). */
const PI_STEPS = [1 / 12, 1 / 6, 1 / 4, 1 / 2, 1, 2, 4, 8, 16];

/** Kleinste π-Schrittweite, deren Abstand mindestens `minUnits` beträgt. */
export function piStep(minUnits: number): number {
  for (const k of PI_STEPS) if (k * Math.PI >= minUnits) return k * Math.PI;
  return niceStep(minUnits / Math.PI) * Math.PI;
}
