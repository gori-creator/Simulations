/**
 * Rechenlogik zu Potenzfunktionen f(x) = a · xⁿ mit ganzzahligem Exponenten n
 * (ohne Zeichnen).
 *
 * Konventionen:
 * - n ∈ {−4, …, 6}, a ist der Streckfaktor (a < 0: an der x-Achse gespiegelt).
 * - n < 0: xⁿ = 1 / x⁻ⁿ, an der Stelle 0 nicht definiert (Polstelle).
 * - n = 0: x⁰ = 1 für x ≠ 0, also f(x) = a. Den Ausdruck 0⁰ betrachten wir
 *   hier nicht: Die Stelle 0 gehört für n = 0 nicht zur Definitionsmenge
 *   (im Bild ein hohler Punkt).
 * - a = 0 ergibt die Nullfunktion (keine Potenzfunktion im eigentlichen Sinn).
 */

export const N_MIN = -4;
export const N_MAX = 6;

/** Alle Exponenten, die die Simulation kennt. */
export const EXPONENTS: readonly number[] = Array.from({ length: N_MAX - N_MIN + 1 }, (_, i) => N_MIN + i);

/** Funktionswert a · xⁿ; nicht definiert (NaN), wenn x = 0 und n ≤ 0. */
export function power(a: number, n: number, x: number): number {
  if (x === 0 && n <= 0) return NaN;
  if (n === 0) return a;
  return a * x ** n;
}

/** Ist die Stelle x in der Definitionsmenge? */
export function isDefinedAt(n: number, x: number): boolean {
  return !(x === 0 && n <= 0);
}

export const isEven = (n: number): boolean => Math.abs(n) % 2 === 0;

/**
 * Die vier Klassen (plus konstante Funktion für n = 0):
 * - evenPos: n gerade, n > 0 (Parabel-artig, beide Äste oben bei a > 0)
 * - oddPos: n ungerade, n > 0 (wie y = x³, von unten links nach oben rechts)
 * - evenNeg: n gerade, n < 0 (Hyperbel-artig, beide Äste oben bei a > 0)
 * - oddNeg: n ungerade, n < 0 (wie y = 1/x, Äste im I. und III. Quadranten)
 */
export type CurveClass = 'evenPos' | 'oddPos' | 'evenNeg' | 'oddNeg' | 'const';

export function curveClass(n: number): CurveClass {
  if (n === 0) return 'const';
  if (n > 0) return isEven(n) ? 'evenPos' : 'oddPos';
  return isEven(n) ? 'evenNeg' : 'oddNeg';
}

/** Symmetrie des Graphen: gerade n → achsensymmetrisch zur y-Achse, ungerade n → punktsymmetrisch zum Ursprung. */
export function symmetry(n: number): 'axis' | 'point' {
  return isEven(n) ? 'axis' : 'point';
}

/**
 * Bezeichnung des Graphen: n ≥ 2 Parabel n-ter Ordnung, n = 1 Gerade
 * (Ursprungsgerade), n = 0 Parallele zur x-Achse, n ≤ −1 Hyperbel |n|-ter Ordnung.
 */
export function curveKind(n: number): { kind: 'parabola' | 'line' | 'constant' | 'hyperbola'; order: number } {
  if (n >= 2) return { kind: 'parabola', order: n };
  if (n === 1) return { kind: 'line', order: 1 };
  if (n === 0) return { kind: 'constant', order: 0 };
  return { kind: 'hyperbola', order: -n };
}

/** Definitionsmenge: ℝ für n > 0, sonst ℝ \ {0}. */
export function domain(n: number): 'R' | 'R\\0' {
  return n > 0 ? 'R' : 'R\\0';
}

/**
 * Wertemenge:
 * - 'R' (ℝ), 'R0+' (ℝ₀⁺ = [0; ∞[), 'R0-' (ℝ₀⁻), 'R+' (ℝ⁺ = ]0; ∞[), 'R-' (ℝ⁻),
 *   'R\\0' (ℝ \ {0}), 'const' ({a}, nur ein Wert).
 */
export type RangeKind = 'R' | 'R0+' | 'R0-' | 'R+' | 'R-' | 'R\\0' | 'const';

export function range(a: number, n: number): RangeKind {
  if (a === 0 || n === 0) return 'const';
  const up = a > 0;
  switch (curveClass(n)) {
    case 'evenPos':
      return up ? 'R0+' : 'R0-';
    case 'oddPos':
      return 'R';
    case 'evenNeg':
      return up ? 'R+' : 'R-';
    default:
      return 'R\\0';
  }
}

export type Trend = 'inc' | 'dec' | 'const';

/**
 * Monotonie links (x < 0) und rechts (x > 0) vom Ursprung.
 * `whole`: Die Funktion ist auf ganz D in derselben Richtung streng monoton
 * (nur bei ungeradem n > 0). Bei ungeradem n < 0 ist sie auf beiden Teilen
 * gleichsinnig, aber NICHT auf ganz D monoton (Sprung über die Polstelle).
 * Für gerades n > 0 gehört die 0 zu beiden Teilintervallen ]−∞; 0] und [0; ∞[.
 */
export function monotony(a: number, n: number): { left: Trend; right: Trend; whole: boolean } {
  if (a === 0 || n === 0) return { left: 'const', right: 'const', whole: true };
  const flip = (t: Trend): Trend => (a > 0 ? t : t === 'inc' ? 'dec' : 'inc');
  switch (curveClass(n)) {
    case 'evenPos':
      return { left: flip('dec'), right: flip('inc'), whole: false };
    case 'oddPos':
      return { left: flip('inc'), right: flip('inc'), whole: true };
    case 'evenNeg':
      return { left: flip('inc'), right: flip('dec'), whole: false };
    default:
      return { left: flip('dec'), right: flip('dec'), whole: false };
  }
}

/** Grenzverhalten: '+inf', '-inf' oder ein Zahlenwert, dem sich f(x) nähert. */
export type Limit = '+inf' | '-inf' | number;

const signedInf = (s: number): Limit => (s > 0 ? '+inf' : '-inf');

/**
 * Verhalten von f(x) für x → −∞, x → +∞ und x → 0 (von links / von rechts).
 * Für n > 0 ist f bei 0 stetig mit f(0) = 0; für n = 0 ist f(x) = a.
 */
export function limits(a: number, n: number): { negInf: Limit; posInf: Limit; zeroLeft: Limit; zeroRight: Limit } {
  if (a === 0) return { negInf: 0, posInf: 0, zeroLeft: 0, zeroRight: 0 };
  if (n === 0) return { negInf: a, posInf: a, zeroLeft: a, zeroRight: a };
  const sl = isEven(n) ? 1 : -1; // Vorzeichen von xⁿ für x < 0
  if (n > 0) return { negInf: signedInf(a * sl), posInf: signedInf(a), zeroLeft: 0, zeroRight: 0 };
  return { negInf: 0, posInf: 0, zeroLeft: signedInf(a * sl), zeroRight: signedInf(a) };
}

/** Asymptoten: nur für n < 0 – senkrecht x = 0 (Polstelle) und waagrecht y = 0. */
export function asymptotes(n: number): { vertical: number | null; horizontal: number | null } {
  return n < 0 ? { vertical: 0, horizontal: 0 } : { vertical: null, horizontal: null };
}

/**
 * Punkte, durch die alle Graphen mit derselben Symmetrie (und demselben a)
 * gehen: (1 | a), (−1 | a) bei geradem n bzw. (−1 | −a) bei ungeradem n,
 * und (0 | 0) für n > 0.
 */
export function commonPoints(a: number, n: number): [number, number][] {
  const pts: [number, number][] = [
    [-1, isEven(n) ? a : -a],
    [1, a],
  ];
  if (n > 0) pts.splice(1, 0, [0, 0]);
  return pts;
}

/**
 * Schnittstellen der Graphen von a · xⁿ und a · xᵐ (a ≠ 0, n ≠ m):
 * Für x ≠ 0 gilt a·xⁿ = a·xᵐ ⇔ x^(n−m) = 1 ⇔ x = 1 oder (n − m gerade) x = −1.
 * Dazu x = 0, wenn beide Exponenten positiv sind (beide Graphen durch den Ursprung).
 * Für a = 0 oder n = m: null (unendlich viele gemeinsame Punkte).
 */
export function intersections(a: number, n: number, m: number): number[] | null {
  if (a === 0 || n === m) return null;
  const xs: number[] = [];
  if (isEven(n - m)) xs.push(-1);
  if (n > 0 && m > 0) xs.push(0);
  xs.push(1);
  return xs;
}

/**
 * Vergleich an der Stelle x: Vorzeichen von a·xⁿ − a·xᵐ (−1, 0, 1),
 * NaN, wenn eine der Funktionen dort nicht definiert ist.
 */
export function compareAt(a: number, n: number, m: number, x: number): number {
  const d = power(a, n, x) - power(a, m, x);
  if (Number.isNaN(d)) return NaN;
  if (Math.abs(d) < 1e-12 * (1 + Math.abs(power(a, n, x)))) return 0;
  return Math.sign(d);
}

/**
 * Intervalle zwischen den Schnittstellen (und der 0), auf denen ein Graph
 * durchgehend über dem anderen liegt. `sign` = Vorzeichen von f − g.
 */
export function compareIntervals(a: number, n: number, m: number): { from: number; to: number; sign: number }[] {
  const xs = intersections(a, n, m);
  if (!xs) return [];
  const cuts = [...new Set([...xs, 0])].sort((p, q) => p - q);
  const bounds = [-Infinity, ...cuts, Infinity];
  const out: { from: number; to: number; sign: number }[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const from = bounds[i]!;
    const to = bounds[i + 1]!;
    const mid = from === -Infinity ? to - 1 : to === Infinity ? from + 1 : (from + to) / 2;
    const s = compareAt(a, n, m, mid);
    const last = out[out.length - 1];
    // Benachbarte Intervalle mit gleichem Vorzeichen zusammenfassen (nur über
    // die 0 hinweg, wenn beide Funktionen dort definiert sind)
    if (last && last.sign === s && last.to === from && (from !== 0 || (n > 0 && m > 0))) last.to = to;
    else out.push({ from, to, sign: s });
  }
  return out;
}

/** Wertetabelle zu den Stellen xs; nicht definierte Werte als null. */
export function valueTable(a: number, n: number, xs: readonly number[]): { x: number; y: number | null }[] {
  return xs.map((x) => {
    const y = power(a, n, x);
    return { x, y: Number.isNaN(y) ? null : y };
  });
}

/* ---------- Übergang zwischen zwei Graphen (Morph) ---------- */

/**
 * Für den weichen Übergang zwischen Graphen werden die Funktionswerte in eine
 * beschränkte Größe umgerechnet (s = arctan(y / Y)), dort gemischt und wieder
 * zurückgerechnet. So wird aus einer Polstelle (s = ±π/2) stetig ein endlicher
 * Wert – der Graph „springt“ nie durch die Asymptote.
 */
export function compress(y: number, scale: number): number {
  return Math.atan(y / scale);
}

export function expand(s: number, scale: number): number {
  const lim = Math.PI / 2 - 1e-9;
  return scale * Math.tan(Math.max(-lim, Math.min(lim, s)));
}

/** Grenzwert von s = arctan(a·xⁿ / Y) für x → 0 von rechts (side = 1) bzw. links (side = −1). */
function compressedNearZero(a: number, n: number, side: 1 | -1, scale: number): number {
  if (n > 0) return 0;
  if (n === 0) return compress(a, scale);
  const sgn = Math.sign(a) * (side < 0 && !isEven(n) ? -1 : 1);
  return (sgn * Math.PI) / 2;
}

/**
 * Gemischter Funktionswert für Gewichte über mehrere Exponenten
 * (Summe der Gewichte = 1). Bei x = 0 wird der Grenzwert der gewählten Seite
 * benutzt, damit die beiden Äste getrennt bleiben.
 */
export function morphValue(weights: readonly { n: number; w: number }[], a: number, x: number, scale: number, side: 1 | -1 = 1): number {
  let s = 0;
  for (const { n, w } of weights) {
    if (w === 0) continue;
    s += w * (x === 0 ? compressedNearZero(a, n, side, scale) : compress(power(a, n, x), scale));
  }
  return expand(s, scale);
}
