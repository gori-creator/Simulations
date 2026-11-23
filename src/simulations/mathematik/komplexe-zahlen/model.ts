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

/* ------------------------------------------------------------------ */
/* Abbildungen der Ebene                                                */
/* ------------------------------------------------------------------ */

export type MapKind = 'mulw' | 'sq' | 'inv' | 'exp' | 'conj' | 'jouk';

/** Bild von z unter der Abbildung (w ist der Faktor bei z ↦ w·z). Für 1/z bei 0: null. */
export function mapZ(kind: MapKind, z: C, w: C): C | null {
  switch (kind) {
    case 'mulw':
      return mul(w, z);
    case 'sq':
      return mul(z, z);
    case 'inv':
      return abs(z) < 1e-9 ? null : div(c(1), z);
    case 'exp':
      return exp(z);
    case 'conj':
      return conj(z);
    case 'jouk':
      return abs(z) < 1e-9 ? null : add(z, div(c(1), z));
  }
}

/** Figuren für die Abbildungen, jeweils als Liste von Linienzügen. */
export function shapeLines(shape: 'grid' | 'circle' | 'house' | 'sector', n = 40): C[][] {
  const out: C[][] = [];
  const seg = (a: C, b: C) => Array.from({ length: n + 1 }, (_, i) => add(a, scale(sub(b, a), i / n)));
  if (shape === 'grid') {
    for (let k = -2; k <= 2; k++) {
      out.push(seg(c(k * 0.5, -1), c(k * 0.5, 1)));
      out.push(seg(c(-1, k * 0.5), c(1, k * 0.5)));
    }
  } else if (shape === 'circle') {
    for (const r of [0.5, 1, 1.5]) out.push(Array.from({ length: 4 * n + 1 }, (_, i) => polar(r, (2 * Math.PI * i) / (4 * n))));
    for (let k = 0; k < 8; k++) out.push(seg(c(0), polar(1.5, (k * Math.PI) / 4)));
  } else if (shape === 'house') {
    const P = [c(0.2, 0.2), c(1.2, 0.2), c(1.2, 0.9), c(0.7, 1.4), c(0.2, 0.9), c(0.2, 0.2)];
    for (let i = 0; i < P.length - 1; i++) out.push(seg(P[i]!, P[i + 1]!));
    out.push(seg(c(0.55, 0.2), c(0.55, 0.6)), seg(c(0.55, 0.6), c(0.85, 0.6)), seg(c(0.85, 0.6), c(0.85, 0.2)));
  } else {
    for (const r of [0.6, 1, 1.4]) out.push(Array.from({ length: n + 1 }, (_, i) => polar(r, (Math.PI / 4) * (i / n))));
    for (const a of [0, Math.PI / 8, Math.PI / 4]) out.push(seg(c(0), polar(1.4, a)));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Polynome: Nullstellen (Fundamentalsatz der Algebra)                   */
/* ------------------------------------------------------------------ */

/**
 * Alle Nullstellen eines Polynoms mit den Koeffizienten aₙ, …, a₀
 * (höchster zuerst) nach Durand–Kerner. Liefert n Nullstellen (mit
 * Vielfachheit) oder [] bei Grad 0.
 */
export function polyRoots(coeffs: readonly C[], iters = 500): C[] {
  let cs = [...coeffs];
  while (cs.length > 1 && abs(cs[0]!) < 1e-12) cs = cs.slice(1);
  const n = cs.length - 1;
  if (n < 1) return [];
  const lead = cs[0]!;
  const monic = cs.map((a) => div(a, lead));
  const R = 1 + Math.max(...monic.slice(1).map(abs));
  const low = [...monic].reverse();
  let z: C[] = Array.from({ length: n }, (_, k) => polar(R * 0.9, (2 * Math.PI * k) / n + 0.4));
  for (let it = 0; it < iters; it++) {
    let delta = 0;
    z = z.map((zi, i) => {
      let den = c(1);
      z.forEach((zj, j) => {
        if (i !== j) den = mul(den, sub(zi, zj));
      });
      const step = abs(den) < 1e-300 ? c(1e-6) : div(evalPoly(low, zi), den);
      delta = Math.max(delta, abs(step));
      return sub(zi, step);
    });
    if (delta < 1e-14) break;
  }
  return z.map((r) => c(Math.abs(r.re) < 1e-10 ? 0 : r.re, Math.abs(r.im) < 1e-10 ? 0 : r.im));
}

/** Koeffizienten aus einem Text wie „1; 0; 0; -1“ (höchster zuerst); null, wenn nicht lesbar. */
export function parseCoeffs(src: string): C[] | null {
  const parts = src.split(/[;|]/).map((s) => s.trim()).filter((s) => s.length);
  if (!parts.length || parts.length > 7) return null;
  const out: C[] = [];
  for (const s of parts) {
    const z = parseC(s);
    if (!z) return null;
    out.push(z);
  }
  return out;
}

/** Sind alle Koeffizienten reell? Dann treten nicht reelle Nullstellen paarweise konjugiert auf. */
export const realCoeffs = (cs: readonly C[]) => cs.every((a) => Math.abs(a.im) < 1e-12);

/** Wert eines Polynoms mit Koeffizienten aₙ, …, a₀ (höchster zuerst). */
export const evalHigh = (coeffs: readonly C[], z: C): C => evalPoly([...coeffs].reverse(), z);

/* ------------------------------------------------------------------ */
/* Iteration z ↦ z² + c (Mandelbrot-Menge)                              */
/* ------------------------------------------------------------------ */

/** Bahn z₀ = 0, zₙ₊₁ = zₙ² + c (höchstens n Schritte, bricht bei |z| > 1000 ab). */
export function orbit(cc: C, n: number, z0: C = c(0)): C[] {
  const out = [z0];
  let z = z0;
  for (let i = 0; i < n; i++) {
    z = add(mul(z, z), cc);
    out.push(z);
    if (abs(z) > 1000) break;
  }
  return out;
}

/** Anzahl der Schritte, bis |z| > 2 (Flucht), höchstens maxIt (dann: c gehört vermutlich zur Menge). */
export function escapeCount(cc: C, maxIt = 60): number {
  let x = 0;
  let y = 0;
  for (let i = 0; i < maxIt; i++) {
    const xn = x * x - y * y + cc.re;
    y = 2 * x * y + cc.im;
    x = xn;
    if (x * x + y * y > 4) return i;
  }
  return maxIt;
}

/* ------------------------------------------------------------------ */
/* Punktmengen in der Zahlenebene                                       */
/* ------------------------------------------------------------------ */

export type SetKind = 'disk' | 'ring' | 'bisect' | 'sector' | 'half';

/**
 * Gehört z zur Menge? a, b sind Punkte, r ein Radius, phiDeg ein Winkel.
 * disk: |z − a| ≤ r · ring: 1 ≤ |z − a| ≤ r · bisect: |z − a| ≤ |z − b|
 * sector: 0° ≤ arg(z − a) ≤ φ und |z − a| ≤ r · half: Re(z) ≥ Re(a)
 */
export function inSet(kind: SetKind, z: C, a: C, b: C, r: number, phiDeg: number): boolean {
  const d = abs(sub(z, a));
  switch (kind) {
    case 'disk':
      return d <= r;
    case 'ring':
      return d >= 1 && d <= r;
    case 'bisect':
      return d <= abs(sub(z, b));
    case 'sector': {
      const ang = ((Math.atan2(z.im - a.im, z.re - a.re) * 180) / Math.PI + 360) % 360;
      return d <= r && ang <= phiDeg + 1e-9;
    }
    case 'half':
      return z.re >= a.re;
  }
}
