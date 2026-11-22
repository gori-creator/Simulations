/**
 * Rechenlogik für komplexe Zahlen: algebraische Form und Polarform,
 * Grundrechenarten, Betrag und Argument, Potenzen und n-te Wurzeln,
 * quadratische Gleichungen in ℂ, Matrixdarstellung [[a, −b], [b, a]]
 * und das Lesen von Eingaben wie „3 + 4i“ oder „2∠45°“.
 * Geprüft in tests/komplexe-zahlen.test.ts.
 */

export interface C {
  readonly re: number;
  readonly im: number;
}

export const c = (re: number, im = 0): C => ({ re, im });
export const I = c(0, 1);
export const add = (a: C, b: C): C => c(a.re + b.re, a.im + b.im);
export const sub = (a: C, b: C): C => c(a.re - b.re, a.im - b.im);
export const mul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const scale = (a: C, k: number): C => c(a.re * k, a.im * k);
export const conj = (a: C): C => c(a.re, -a.im);
export const abs = (a: C): number => Math.hypot(a.re, a.im);
export const neg = (a: C): C => c(-a.re, -a.im);

/** Division a / b (b ≠ 0) über das Erweitern mit dem konjugierten Nenner. */
export function div(a: C, b: C): C {
  const d = b.re * b.re + b.im * b.im;
  if (d === 0) throw new RangeError('Division durch 0');
  const num = mul(a, conj(b));
  return c(num.re / d, num.im / d);
}

/** Argument im Bogenmaß, (−π, π]. */
export const arg = (a: C): number => Math.atan2(a.im, a.re);
/** Argument in Grad, [0°, 360°) – schulübliche Angabe. */
export function argDeg(a: C): number {
  let d = (arg(a) * 180) / Math.PI;
  if (d < 0) d += 360;
  // Rundungsrest knapp unter 360° als 0° zeigen
  return d > 360 - 1e-7 ? 0 : d;
}

/** Zahl aus Polarform r · (cos φ + i sin φ). */
export const polar = (r: number, phi: number): C => c(r * Math.cos(phi), r * Math.sin(phi));
export const polarDeg = (r: number, deg: number): C => polar(r, (deg * Math.PI) / 180);

/** Ganzzahlige Potenz zⁿ (auch negativ) durch wiederholtes Malnehmen. */
export function powInt(z: C, n: number): C {
  if (!Number.isInteger(n)) throw new RangeError('n ganzzahlig');
  if (n < 0) return div(c(1), powInt(z, -n));
  let r = c(1);
  for (let k = 0; k < n; k++) r = mul(r, z);
  return r;
}

/** Potenz nach Moivre: (r, φ)ⁿ = (rⁿ, n·φ). */
export const powMoivre = (z: C, n: number): C => polar(abs(z) ** n, arg(z) * n);

/** Die n Lösungen von zⁿ = w, nach dem Winkel geordnet (k = 0 … n − 1). */
export function nthRoots(w: C, n: number): C[] {
  const r = abs(w) ** (1 / n);
  const phi = arg(w);
  return Array.from({ length: n }, (_, k) => polar(r, (phi + 2 * Math.PI * k) / n));
}

/** Quadratwurzel (Hauptwert, Realteil ≥ 0). */
export function sqrtC(w: C): C {
  const r = abs(w);
  const re = Math.sqrt((r + w.re) / 2);
  const im = Math.sign(w.im || 1) * Math.sqrt(Math.max(0, (r - w.re) / 2));
  return c(re, im);
}

export const exp = (z: C): C => polar(Math.exp(z.re), z.im);

/**
 * Lösungen von z² + p·z + q = 0 (p, q komplex) mit der p-q-Formel.
 * `disc` ist die Diskriminante D = (p/2)² − q.
 */
export function solveQuadratic(p: C, q: C): { disc: C; roots: [C, C] } {
  const h = scale(p, -0.5);
  const disc = sub(mul(scale(p, 0.5), scale(p, 0.5)), q);
  const s = sqrtC(disc);
  return { disc, roots: [add(h, s), sub(h, s)] };
}

/** Wert eines Polynoms mit Koeffizienten [a₀, a₁, …] an der Stelle z (Horner). */
export function evalPoly(coeffs: readonly C[], z: C): C {
  let r = c(0);
  for (let k = coeffs.length - 1; k >= 0; k--) r = add(mul(r, z), coeffs[k]!);
  return r;
}

/* ------------------------------------------------------------------ */
/* Matrixdarstellung                                                    */
/* ------------------------------------------------------------------ */

export type M2 = readonly [readonly [number, number], readonly [number, number]];

/** a + b·i ↦ [[a, −b], [b, a]] (Drehstreckung der Ebene). */
export const toMatrix = (z: C): M2 => [
  [z.re, -z.im],
  [z.im, z.re],
];
export const fromMatrix = (m: M2): C => c(m[0][0], m[1][0]);
export const matMul = (a: M2, b: M2): M2 => [
  [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
  [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
];
export const matApply = (m: M2, v: readonly [number, number]): [number, number] => [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
export const det = (m: M2) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

/* ------------------------------------------------------------------ */
/* Text                                                                 */
/* ------------------------------------------------------------------ */

type Fmt = (v: number) => string;
const MINUS = '−';

/** Algebraische Form „3 + 4i“, „−2i“, „1 − i“. */
export function cText(z: C, num: Fmt): string {
  const re = Math.abs(z.re) < 1e-10 ? 0 : z.re;
  const im = Math.abs(z.im) < 1e-10 ? 0 : z.im;
  const imPart = (v: number, lead: boolean) => {
    const a = Math.abs(v);
    const coef = Math.abs(a - 1) < 1e-10 ? '' : num(a);
    if (lead) return `${v < 0 ? MINUS : ''}${coef}i`;
    return ` ${v < 0 ? MINUS : '+'} ${coef}i`;
  };
  if (im === 0) return re < 0 ? `${MINUS}${num(-re)}` : num(re);
  if (re === 0) return imPart(im, true);
  return `${re < 0 ? MINUS : ''}${num(Math.abs(re))}${imPart(im, false)}`;
}

/** Polarform „5 · (cos 53,13° + i · sin 53,13°)“. */
export function polarText(z: C, num: Fmt, numDeg: Fmt = num): string {
  return `${num(abs(z))} · (cos ${numDeg(argDeg(z))}° + i · sin ${numDeg(argDeg(z))}°)`;
}

/** Exponentialform „5 · e^(i · 0,927)“. */
export function expText(z: C, num: Fmt): string {
  return `${num(abs(z))} · e^(i · ${num(arg(z) < 0 ? arg(z) + 2 * Math.PI : arg(z))})`;
}

/* ------------------------------------------------------------------ */
/* Eingaben lesen                                                       */
/* ------------------------------------------------------------------ */

/**
 * Liest eine komplexe Zahl: „3 + 4i“, „−2i“, „i“, „1,5 − 0,5i“, „4i − 1“,
 * Polarform „2∠45°“ bzw. „2∠45“ (Grad) oder „2·e^(i·0,5)“ (Bogenmaß).
 */
export function parseC(src: string): C | null {
  let s = src.replace(/−/g, '-').replace(/[·*×]/g, '').replace(/\s+/g, '').replace(/,/g, '.').replace(/j/g, 'i');
  if (!s) return null;
  // Polarform
  const pol = /^(\d+(?:\.\d+)?)∠(-?\d+(?:\.\d+)?)°?$/.exec(s);
  if (pol) return polarDeg(+pol[1]!, +pol[2]!);
  const ex = /^(\d+(?:\.\d+)?)?e\^\(?i(-?\d+(?:\.\d+)?)\)?$/.exec(s);
  if (ex) return polar(ex[1] ? +ex[1] : 1, +ex[2]!);
  // Summe aus reellen und imaginären Teilen
  if (!/^[-+]?[\d.i+-]+$/.test(s)) return null;
  if (!/^[-+]/.test(s)) s = '+' + s;
  const parts = s.match(/[-+][^-+]*/g);
  if (!parts) return null;
  let re = 0;
  let im = 0;
  for (const p of parts) {
    const sign = p[0] === '-' ? -1 : 1;
    const body = p.slice(1);
    if (!body) return null;
    if (body.endsWith('i')) {
      const coef = body.slice(0, -1);
      if (coef && !/^\d+(\.\d+)?$/.test(coef)) return null;
      im += sign * (coef ? +coef : 1);
    } else {
      if (!/^\d+(\.\d+)?$/.test(body)) return null;
      re += sign * +body;
    }
  }
  return c(re, im);
}
