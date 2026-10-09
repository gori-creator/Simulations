/**
 * Gleichungen grafisch lösen: f(x) = g(x).
 *
 * Beide Seiten der Gleichung sind Funktionen einer der Arten
 * - linear:        f(x) = m·x + t
 * - quadratisch:   f(x) = a·(x − d)² + e      (Scheitel S(d | e))
 * - Hyperbel:      f(x) = a / (x − d) + e     (Asymptoten x = d und y = e)
 * - Betrag:        f(x) = a·|x − d| + e       (Knick bei (d | e))
 *
 * Die Lösungen sind die x-Koordinaten der Schnittpunkte beider Graphen,
 * gleichbedeutend mit den Nullstellen der Differenzfunktion h = f − g.
 *
 * Rechenweg: Die x-Achse wird an den Knickstellen und Polstellen in Stücke
 * geteilt. Auf jedem Stück ist f = P₁/Q₁ und g = P₂/Q₂ mit Polynomen, also
 * h = (P₁·Q₂ − P₂·Q₁) / (Q₁·Q₂). Die Nullstellen des Zählers (Grad ≤ 3)
 * werden exakt (Grad ≤ 2) bzw. sicher numerisch (Grad 3) bestimmt.
 */

export type Lang = 'de' | 'en';
export type Kind = 'lin' | 'quad' | 'hyp' | 'abs';
export const KINDS: readonly Kind[] = ['lin', 'quad', 'hyp', 'abs'];

/** Eine Seite der Gleichung. Je nach Art werden m, t bzw. a, d, e benutzt. */
export interface Fn {
  kind: Kind;
  m: number;
  t: number;
  a: number;
  d: number;
  e: number;
}

const MINUS = '−';

/* ------------------------------------------------------------------ */
/* Funktionswerte                                                      */
/* ------------------------------------------------------------------ */

/** Funktionswert; NaN außerhalb der Definitionsmenge (Polstelle der Hyperbel). */
export function evalFn(f: Fn, x: number): number {
  switch (f.kind) {
    case 'lin':
      return f.m * x + f.t;
    case 'quad':
      return f.a * (x - f.d) ** 2 + f.e;
    case 'hyp':
      return x === f.d ? NaN : f.a / (x - f.d) + f.e;
    case 'abs':
      return f.a * Math.abs(x - f.d) + f.e;
  }
}

/** Polstelle (Definitionslücke) einer Seite, sonst null. */
export function poleOf(f: Fn): number | null {
  return f.kind === 'hyp' ? f.d : null;
}

/** Knickstelle (Betrag), sonst null. */
export function kinkOf(f: Fn): number | null {
  return f.kind === 'abs' && f.a !== 0 ? f.d : null;
}

/** Ist die Seite ein Polynom (linear oder quadratisch)? */
export const isPolynomial = (f: Fn) => f.kind === 'lin' || f.kind === 'quad';

/** Differenzfunktion h(x) = f(x) − g(x). */
export function diffAt(f: Fn, g: Fn, x: number): number {
  return evalFn(f, x) - evalFn(g, x);
}

/* ------------------------------------------------------------------ */
/* Polynome (Koeffizienten aufsteigend: c[0] + c[1]·x + c[2]·x² …)     */
/* ------------------------------------------------------------------ */

export type Poly = number[];

export function polyMul(p: Poly, q: Poly): Poly {
  const r: Poly = new Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => (r[i + j]! += a * b)));
  return r;
}

export function polySub(p: Poly, q: Poly): Poly {
  const n = Math.max(p.length, q.length);
  return Array.from({ length: n }, (_, i) => (p[i] ?? 0) - (q[i] ?? 0));
}

export function polyEval(p: Poly, x: number): number {
  let y = 0;
  for (let i = p.length - 1; i >= 0; i--) y = y * x + p[i]!;
  return y;
}

/** Führende (fast) verschwindende Koeffizienten entfernen. */
export function polyTrim(p: Poly, tol = 1e-12): Poly {
  const scale = Math.max(1, ...p.map(Math.abs));
  const r = p.slice();
  while (r.length > 1 && Math.abs(r[r.length - 1]!) <= tol * scale) r.pop();
  if (r.length === 1 && Math.abs(r[0]!) <= tol * scale) r[0] = 0;
  return r;
}

/** Darstellung eines Stücks als Bruch P/Q. */
interface Rational {
  p: Poly;
  q: Poly;
}

/** f als P/Q, gültig auf dem Stück, das die Stelle `probe` enthält. */
function rationalOf(f: Fn, probe: number): Rational {
  switch (f.kind) {
    case 'lin':
      return { p: [f.t, f.m], q: [1] };
    case 'quad':
      return { p: [f.a * f.d * f.d + f.e, -2 * f.a * f.d, f.a], q: [1] };
    case 'hyp':
      return { p: [f.a - f.e * f.d, f.e], q: [-f.d, 1] };
    case 'abs': {
      const s = probe >= f.d ? 1 : -1;
      return { p: [f.e - s * f.a * f.d, s * f.a], q: [1] };
    }
  }
}

/** Polynomteil einer Seite (nur linear/quadratisch). */
export function polyOf(f: Fn): Poly | null {
  if (!isPolynomial(f)) return null;
  return rationalOf(f, 0).p;
}

/* ------------------------------------------------------------------ */
/* Nullstellen von Polynomen vom Grad ≤ 3                              */
/* ------------------------------------------------------------------ */

export interface PolyRoot {
  x: number;
  /** Doppelte (gerade) Nullstelle: kein Vorzeichenwechsel. */
  double: boolean;
}

/** Bisektion auf [lo, hi] mit Vorzeichenwechsel. */
function bisectRoot(f: (x: number) => number, lo: number, hi: number): number {
  let flo = f(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (mid === lo || mid === hi) break;
    const fm = f(mid);
    if (fm === 0) return mid;
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Reelle Nullstellen eines Polynoms vom Grad ≤ 3 (nicht das Nullpolynom),
 * aufsteigend sortiert. Doppelte Nullstellen werden einmal gemeldet.
 */
export function polyRoots(c: Poly): PolyRoot[] {
  const p = polyTrim(c);
  const deg = p.length - 1;
  if (deg <= 0) return [];
  if (deg === 1) return [{ x: -p[0]! / p[1]!, double: false }];
  if (deg === 2) {
    const [c0, b, a] = p as [number, number, number];
    const disc = b * b - 4 * a * c0;
    const scale = b * b + Math.abs(4 * a * c0);
    if (Math.abs(disc) <= 1e-11 * scale) return [{ x: -b / (2 * a), double: true }];
    if (disc < 0) return [];
    // numerisch stabile Lösungsformel
    const s = Math.sqrt(disc);
    const qq = -0.5 * (b + (b >= 0 ? s : -s));
    const x1 = qq / a;
    const x2 = qq !== 0 ? c0 / qq : -x1;
    return [x1, x2].sort((u, v) => u - v).map((x) => ({ x, double: false }));
  }
  // Grad 3: Extremstellen trennen monotone Abschnitte
  const f = (x: number) => polyEval(p, x);
  const lead = Math.abs(p[3]!);
  const bound = 1 + Math.max(...p.slice(0, 3).map((v) => Math.abs(v) / lead));
  const crit = polyRoots([p[1]!, 2 * p[2]!, 3 * p[3]!])
    .map((r) => r.x)
    .filter((x) => x > -bound && x < bound);
  const pts = [-bound, ...crit, bound];
  const scale = Math.max(...p.map(Math.abs));
  const roots: PolyRoot[] = [];
  const near = (x: number) => roots.some((r) => Math.abs(r.x - x) < 1e-9 * Math.max(1, Math.abs(x)));
  // Nullstellen an Extremstellen: doppelt (Berühren) oder dreifach (Wendepunkt)
  for (const x of crit) {
    if (Math.abs(f(x)) <= 1e-10 * scale * Math.max(1, Math.abs(x) ** 3) && !near(x)) {
      const delta = 1e-4 * Math.max(1, Math.abs(x));
      roots.push({ x, double: Math.sign(f(x - delta)) === Math.sign(f(x + delta)) });
    }
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const lo = pts[i]!;
    const hi = pts[i + 1]!;
    const flo = f(lo);
    const fhi = f(hi);
    if (Math.sign(flo) * Math.sign(fhi) < 0) {
      const x = bisectRoot(f, lo, hi);
      if (!near(x)) roots.push({ x, double: false });
    }
  }
  return roots.map((r) => ({ x: r.x + 0, double: r.double })).sort((u, v) => u.x - v.x);
}

/* ------------------------------------------------------------------ */
/* Lösen der Gleichung f(x) = g(x)                                     */
/* ------------------------------------------------------------------ */

export interface Root {
  x: number;
  y: number;
  /** Berührpunkt: h = f − g wechselt das Vorzeichen nicht. */
  touch: boolean;
  /** Exakte Darstellung (falls bekannt), z. B. „(1 + √5)/2“. */
  exact: Exact | null;
}

/** Bereich, in dem beide Graphen zusammenfallen. */
export interface Span {
  from: number;
  to: number;
  /** Rand gehört dazu (bei ±∞ bedeutungslos). */
  fromIn: boolean;
  toIn: boolean;
}

export interface Solution {
  roots: Root[];
  spans: Span[];
  /** Definitionslücken (Polstellen) der Gleichung. */
  gaps: number[];
}

export type Case = 'none' | 'one' | 'touch' | 'two' | 'many' | 'infinite';

const EPS_X = 1e-9;

/** Löst f(x) = g(x) über ℝ (ohne die Polstellen). */
export function solveEquation(f: Fn, g: Fn): Solution {
  const gaps = [poleOf(f), poleOf(g)].filter((v): v is number => v !== null);
  const kinks = [kinkOf(f), kinkOf(g)].filter((v): v is number => v !== null);
  const breaks = [...new Set([...gaps, ...kinks])].sort((u, v) => u - v);
  const bounds = [-Infinity, ...breaks, Infinity];
  const h = (x: number) => diffAt(f, g, x);
  const roots: { x: number; double: boolean | null; exact: Exact | null }[] = [];
  const spans: Span[] = [];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const lo = bounds[i]!;
    const hi = bounds[i + 1]!;
    const probe = Number.isFinite(lo) && Number.isFinite(hi) ? (lo + hi) / 2 : Number.isFinite(lo) ? lo + 1 : Number.isFinite(hi) ? hi - 1 : 0;
    const rf = rationalOf(f, probe);
    const rg = rationalOf(g, probe);
    const num = polyTrim(polySub(polyMul(rf.p, rg.q), polyMul(rg.p, rf.q)));
    if (num.length === 1 && num[0] === 0) {
      spans.push({ from: lo, to: hi, fromIn: false, toIn: false });
      continue;
    }
    const exacts = num.length === 3 ? exactQuadraticRoots(num) : num.length === 2 ? exactLinearRoot(num) : null;
    for (const r of polyRoots(num)) {
      if (!(r.x > lo + EPS_X && r.x < hi - EPS_X)) continue;
      if (gaps.some((gp) => Math.abs(gp - r.x) < EPS_X)) continue;
      let ex = exacts?.find((e) => Math.abs(exactValue(e) - r.x) < 1e-7 * Math.max(1, Math.abs(r.x))) ?? null;
      let x = ex ? exactValue(ex) : r.x;
      if (!ex) {
        // Numerisch gefundene Lösung, die in Wahrheit eine kurze Dezimalzahl ist (z. B. −1)?
        const snap = roundTo(r.x, 3);
        const scale = Math.max(1, Math.abs(evalFn(f, snap)), Math.abs(evalFn(g, snap)));
        if (Math.abs(snap - r.x) < 1e-6 && Math.abs(h(snap)) <= 1e-12 * scale) {
          x = snap;
          ex = rationalExact(snap);
        }
      }
      roots.push({ x, double: r.double, exact: ex });
    }
  }
  // Knickstellen selbst prüfen (beide Seiten dort definiert)
  for (const k of kinks) {
    if (gaps.some((gp) => Math.abs(gp - k) < EPS_X)) continue;
    const v = h(k);
    const scale = Math.max(1, Math.abs(evalFn(f, k)), Math.abs(evalFn(g, k)));
    if (Math.abs(v) <= 1e-10 * scale && !roots.some((r) => Math.abs(r.x - k) < 1e-9)) roots.push({ x: k, double: null, exact: rationalExact(k) });
  }
  // Zusammenhängende Bereiche und Randpunkte zusammenfassen
  const merged: Span[] = [];
  for (const s of spans) {
    const prev = merged[merged.length - 1];
    const joinAt = prev && prev.to === s.from ? s.from : null;
    const atRoot = joinAt !== null && roots.some((r) => Math.abs(r.x - joinAt) < 1e-9);
    if (prev && joinAt !== null && atRoot) {
      prev.to = s.to;
      continue;
    }
    merged.push({ ...s });
  }
  for (const s of merged) {
    s.fromIn = Number.isFinite(s.from) && roots.some((r) => Math.abs(r.x - s.from) < 1e-9);
    s.toIn = Number.isFinite(s.to) && roots.some((r) => Math.abs(r.x - s.to) < 1e-9);
  }
  const inSpan = (x: number) => merged.some((s) => (x > s.from && x < s.to) || (s.fromIn && Math.abs(x - s.from) < 1e-9) || (s.toIn && Math.abs(x - s.to) < 1e-9));
  const sorted = roots.filter((r) => !inSpan(r.x)).sort((u, v) => u.x - v.x);
  // Berühren oder Schneiden: Vorzeichen von h links und rechts der Nullstelle
  const marks = [...sorted.map((r) => r.x), ...breaks].sort((u, v) => u - v);
  const out: Root[] = sorted.map((r) => {
    let touch: boolean;
    if (r.double !== null && !kinks.some((k) => Math.abs(k - r.x) < 1e-9)) touch = r.double;
    else {
      const others = marks.filter((m) => Math.abs(m - r.x) > 1e-9).map((m) => Math.abs(m - r.x));
      const delta = Math.min(1e-3, ...others.map((d) => d / 3));
      touch = Math.sign(h(r.x - delta)) * Math.sign(h(r.x + delta)) > 0;
    }
    return { x: r.x, y: evalFn(f, r.x), touch, exact: r.exact };
  });
  return { roots: out, spans: merged, gaps };
}

/** Anzahl der Lösungen in Worten. */
export function caseOf(sol: Solution): Case {
  if (sol.spans.length) return 'infinite';
  const n = sol.roots.length;
  if (n === 0) return 'none';
  if (n === 1) return sol.roots[0]!.touch ? 'touch' : 'one';
  if (n === 2) return 'two';
  return 'many';
}

/* ------------------------------------------------------------------ */
/* Exakte Werte: Brüche und Wurzeln                                    */
/* ------------------------------------------------------------------ */

/** Exakte Zahl (P + C·√R) / Q mit ganzen Zahlen, R quadratfrei (R = 1: rational). */
export interface Exact {
  p: number;
  c: number;
  r: number;
  q: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function exactValue(e: Exact): number {
  return (e.p + e.c * Math.sqrt(e.r)) / e.q;
}

/** Zahl als Bruch mit kleinem Nenner (die Regler haben Schritte von 0,25). */
export function toFraction(x: number, maxDen = 4096): { n: number; d: number } | null {
  if (!Number.isFinite(x)) return null;
  for (let d = 1; d <= maxDen; d *= 2) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-12 * Math.max(1, Math.abs(x))) return { n, d };
  }
  return null;
}

function normalize(e: Exact): Exact {
  let { p, c, r, q } = e;
  if (q < 0) {
    p = -p;
    c = -c;
    q = -q;
  }
  // Quadratischen Faktor aus der Wurzel ziehen
  if (r > 1) {
    for (let k = Math.floor(Math.sqrt(r)); k >= 2; k--) {
      if (r % (k * k) === 0) {
        r /= k * k;
        c *= k;
        break;
      }
    }
  }
  if (r === 1) {
    p += c;
    c = 0;
  }
  if (c === 0) r = 1;
  const g = gcd(gcd(p, c), q) || 1;
  return { p: p / g, c: c / g, r, q: q / g };
}

/** Rationale Zahl als exakter Wert (oder null). */
export function rationalExact(x: number): Exact | null {
  const fr = toFraction(x);
  return fr ? normalize({ p: fr.n, c: 0, r: 1, q: fr.d }) : null;
}

function exactLinearRoot(num: Poly): Exact[] | null {
  const a = toFraction(num[1]!);
  const b = toFraction(num[0]!);
  if (!a || !b || a.n === 0) return null;
  // x = −b/a = −(bn/bd) / (an/ad) = −bn·ad / (bd·an)
  return [normalize({ p: -b.n * a.d, c: 0, r: 1, q: b.d * a.n })];
}

/** Exakte Lösungen von a·x² + b·x + c = 0 mit rationalen Koeffizienten (Lösungsformel). */
function exactQuadraticRoots(num: Poly): Exact[] | null {
  const fc = num.map((v) => toFraction(v));
  if (fc.some((v) => !v)) return null;
  // Auf gemeinsamen Nenner bringen: ganzzahlige Koeffizienten A, B, C
  const den = fc.reduce((l, v) => (l * v!.d) / gcd(l, v!.d), 1);
  const [C, B, A] = fc.map((v) => (v!.n * den) / v!.d) as [number, number, number];
  if (![A, B, C].every((v) => Number.isSafeInteger(v)) || A === 0) return null;
  const D = B * B - 4 * A * C;
  if (!Number.isSafeInteger(D) || D < 0) return null;
  if (D === 0) return [normalize({ p: -B, c: 0, r: 1, q: 2 * A })];
  const s = Math.round(Math.sqrt(D));
  if (s * s === D) return [normalize({ p: -B - s, c: 0, r: 1, q: 2 * A }), normalize({ p: -B + s, c: 0, r: 1, q: 2 * A })];
  return [normalize({ p: -B, c: -1, r: D, q: 2 * A }), normalize({ p: -B, c: 1, r: D, q: 2 * A })];
}

/* ------------------------------------------------------------------ */
/* Zahlen als Text                                                     */
/* ------------------------------------------------------------------ */

/** Zahl mit höchstens `dec` Nachkommastellen, Dezimalkomma (DE) und echtem Minus. */
/** Runden auf `dec` Stellen, bei ,5 vom Nullpunkt weg (wie in der Schule: −1,5 ≈ −2). */
export function roundTo(v: number, dec: number): number {
  const k = 10 ** dec;
  return (Math.sign(v) * Math.round(Math.abs(v) * k + 1e-9)) / k;
}

/** Wie viele Nachkommastellen braucht v höchstens (bis `max`), um exakt dazustehen? */
export function decimalsOf(v: number, max = 6): number {
  for (let k = 0; k < max; k++) if (Math.abs(roundTo(v, k) - v) < 1e-12 * Math.max(1, Math.abs(v))) return k;
  return max;
}

export function numText(v: number, lang: Lang, dec = 3): string {
  const r = roundTo(v, dec);
  if (Object.is(r, -0) || r === 0) return '0';
  let s = Math.abs(r).toFixed(dec);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (lang === 'de') s = s.replace('.', ',');
  return (r < 0 ? MINUS : '') + s;
}

/** Endet die Dezimaldarstellung nach höchstens 3 Stellen? */
export function isShortDecimal(v: number): boolean {
  return Math.abs(roundTo(v, 3) - v) < 1e-9;
}

/** Exakter Wert als Text: „2“, „−1,5“, „4/3“, „√2“, „(1 − √5)/2“. */
export function exactText(e: Exact, lang: Lang): string {
  const v = exactValue(e);
  if (e.c === 0) {
    if (e.q === 1 || isShortDecimal(v)) return numText(v, lang);
    return `${e.p < 0 ? MINUS : ''}${Math.abs(e.p)}/${e.q}`;
  }
  const root = `${Math.abs(e.c) === 1 ? '' : Math.abs(e.c)}√${e.r}`;
  if (e.p === 0) {
    const body = e.q === 1 ? root : `${root}/${e.q}`;
    return (e.c < 0 ? MINUS : '') + body;
  }
  const inner = `${e.p < 0 ? MINUS : ''}${Math.abs(e.p)} ${e.c < 0 ? MINUS : '+'} ${root}`;
  return e.q === 1 ? inner : `(${inner})/${e.q}`;
}

/** Ist der exakte Wert „einfach“ (ganz oder kurze Dezimalzahl)? Dann kein ≈ nötig. */
export function isSimple(e: Exact | null): boolean {
  return !!e && e.c === 0 && isShortDecimal(exactValue(e));
}

/** Lösung als Text: exakt, wenn möglich, sonst gerundet mit „≈“. */
export function rootText(r: Root, lang: Lang, dec = 2): string {
  if (r.exact && isSimple(r.exact)) return exactText(r.exact, lang);
  return `≈ ${numText(r.x, lang, dec)}`;
}

/* ------------------------------------------------------------------ */
/* Terme als Bausteine (für den Formelsatz)                            */
/* ------------------------------------------------------------------ */

/** Formelbaustein: Text, Variable x, Hochzahl, Bruch oder Betrag. */
export type Part =
  | { k: 't'; s: string }
  | { k: 'x' }
  | { k: 'sup'; s: string }
  | { k: 'frac'; num: Part[]; den: Part[] }
  | { k: 'abs'; inner: Part[] };

const T = (s: string): Part => ({ k: 't', s });
const X: Part = { k: 'x' };

/** „x − d“ bzw. „x + 2“ bzw. „x“. */
function shifted(d: number, lang: Lang): Part[] {
  if (d === 0) return [X];
  return [X, T(` ${d > 0 ? MINUS : '+'} ${numText(Math.abs(d), lang)}`)];
}

/** Absolutglied „ + e“ / „ − e“ (leer bei 0). */
function constTail(e: number, lang: Lang): Part[] {
  if (e === 0) return [];
  return [T(` ${e < 0 ? MINUS : '+'} ${numText(Math.abs(e), lang)}`)];
}

/** Vorfaktor vor einem Ausdruck: „“, „−“, „2“, „−0,5“. */
function factor(a: number, lang: Lang): Part[] {
  if (a === 1) return [];
  if (a === -1) return [T(MINUS)];
  return [T(numText(a, lang))];
}

/** Polynom (aufsteigende Koeffizienten) als Bausteine: „x² − 0,5x − 3“. */
export function polyParts(c: Poly, lang: Lang): Part[] {
  const out: Part[] = [];
  for (let i = c.length - 1; i >= 0; i--) {
    const v = Math.round(c[i]! * 1e9) / 1e9;
    if (v === 0) continue;
    const first = out.length === 0;
    const abs = Math.abs(v);
    const sign = v < 0 ? (first ? MINUS : ` ${MINUS} `) : first ? '' : ' + ';
    const coef = i > 0 && abs === 1 ? '' : numText(abs, lang);
    if (sign || coef) out.push(T(sign + coef));
    if (i >= 1) out.push(X);
    if (i >= 2) out.push({ k: 'sup', s: String(i) });
  }
  if (!out.length) out.push(T('0'));
  return out;
}

/** Term einer Seite als Bausteine. */
export function termParts(f: Fn, lang: Lang): Part[] {
  switch (f.kind) {
    case 'lin':
      return polyParts([f.t, f.m], lang);
    case 'quad': {
      if (f.a === 0) return [T(numText(f.e, lang))];
      const base: Part[] = f.d === 0 ? [X] : [T('('), ...shifted(f.d, lang), T(')')];
      return [...factor(f.a, lang), ...base, { k: 'sup', s: '2' }, ...constTail(f.e, lang)];
    }
    case 'hyp': {
      const den = shifted(f.d, lang);
      if (f.a === 0) return [T('0'), T('/'), T('('), ...den, T(')'), ...constTail(f.e, lang)];
      const sign = f.a < 0 ? [T(MINUS)] : [];
      return [...sign, { k: 'frac', num: [T(numText(Math.abs(f.a), lang))], den }, ...constTail(f.e, lang)];
    }
    case 'abs': {
      if (f.a === 0) return [T(numText(f.e, lang))];
      return [...factor(f.a, lang), { k: 'abs', inner: shifted(f.d, lang) }, ...constTail(f.e, lang)];
    }
  }
}

/** Bausteine als einfacher Text (Ergebnisse, Tests): „2/(x − 1) + 3“, „|x + 1|“. */
export function partsText(parts: Part[]): string {
  return parts
    .map((p) => {
      switch (p.k) {
        case 't':
          return p.s;
        case 'x':
          return 'x';
        case 'sup':
          return p.s.replace(/[0-9]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!);
        case 'frac': {
          const n = partsText(p.num);
          const d = partsText(p.den);
          return `${p.num.length > 1 ? `(${n})` : n}/${p.den.length > 1 ? `(${d})` : d}`;
        }
        case 'abs':
          return `|${partsText(p.inner)}|`;
      }
    })
    .join('');
}

/**
 * Zahl für x einsetzen (Probe): negative Zahlen in Klammern, zwischen
 * Vorfaktor und eingesetzter Zahl ein Malpunkt („0,5 · 2“).
 */
export function substParts(parts: Part[], value: string): Part[] {
  const negative = value.startsWith(MINUS);
  const out: Part[] = [];
  parts.forEach((q, i) => {
    if (q.k === 'x') {
      const prev = out[out.length - 1];
      const afterNumber = prev?.k === 't' && /[0-9]$/.test(prev.s);
      const powered = parts[i + 1]?.k === 'sup';
      const wrap = negative || (powered && value.includes('√'));
      out.push({ k: 't', s: `${afterNumber ? ' · ' : ''}${wrap ? `(${value})` : value}` });
    } else if (q.k === 'frac') out.push({ k: 'frac', num: substParts(q.num, value), den: substParts(q.den, value) });
    else if (q.k === 'abs') out.push({ k: 'abs', inner: substParts(q.inner, value) });
    else out.push(q);
  });
  return out;
}

/** Hat der Term mehrere Glieder (für Klammern beim Abziehen)? */
export function isCompound(f: Fn): boolean {
  const parts = termParts(f, 'en');
  const first = parts[0];
  if (first?.k === 't' && first.s.startsWith(MINUS)) return true;
  let depth = 0;
  for (const p of parts) {
    if (p.k !== 't') continue;
    if (p.s === '(') depth++;
    else if (p.s === ')') depth--;
    else if (depth === 0 && /^ [+−] /.test(p.s)) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Intervallhalbierung                                                 */
/* ------------------------------------------------------------------ */

export interface Interval {
  a: number;
  b: number;
}

/**
 * Startintervall für die Intervallhalbierung um die Nullstelle x0 von h:
 * möglichst ganzzahlige Grenzen (Breite 1), sonst halbe, viertel … – so,
 * dass h auf dem Intervall stetig ist, das Vorzeichen wechselt und keine
 * weitere Nullstelle darin liegt.
 */
export function startInterval(h: (x: number) => number, x0: number, avoid: readonly number[]): Interval | null {
  for (let w = 1; w >= 1 / 1024; w /= 2) {
    const isGrid = Math.abs(x0 / w - Math.round(x0 / w)) < 1e-9;
    // Liegt x0 genau auf dem Raster, steht es in der Mitte (Treffer im ersten Schritt)
    const a = isGrid ? x0 - w : Math.floor(x0 / w) * w;
    const b = isGrid ? x0 + w : a + w;
    if (avoid.some((v) => Math.abs(v - x0) > 1e-9 && v >= a - 1e-12 && v <= b + 1e-12)) continue;
    const ha = h(a);
    const hb = h(b);
    if (!Number.isFinite(ha) || !Number.isFinite(hb)) continue;
    if (Math.sign(ha) * Math.sign(hb) < 0) return { a, b };
  }
  return null;
}

export interface BisectStep extends Interval {
  m: number;
  hm: number;
  /** Welche Hälfte bleibt: links [a; m] oder rechts [m; b]; 'hit' bei h(m) = 0. */
  keep: 'left' | 'right' | 'hit';
}

/** Ein Schritt: Mitte m bestimmen und die Hälfte mit Vorzeichenwechsel behalten. */
export function bisectStep(h: (x: number) => number, iv: Interval): BisectStep {
  const m = (iv.a + iv.b) / 2;
  const hm = h(m);
  const ha = h(iv.a);
  const scale = Math.max(1e-12, Math.abs(ha), Math.abs(h(iv.b)));
  if (Math.abs(hm) <= 1e-13 * scale || hm === 0) return { ...iv, m, hm: 0, keep: 'hit' };
  return { ...iv, m, hm, keep: Math.sign(hm) === Math.sign(ha) ? 'right' : 'left' };
}

/** Nachfolgendes Intervall nach einem Schritt. */
export function nextInterval(s: BisectStep): Interval {
  if (s.keep === 'hit') return { a: s.m, b: s.m };
  return s.keep === 'left' ? { a: s.a, b: s.m } : { a: s.m, b: s.b };
}

/**
 * Größte Stellenzahl k (höchstens 6), für die alle Zahlen zwischen a und b
 * auf k Nachkommastellen gerundet denselben Wert haben; −1, wenn es keine gibt.
 * (Runden ist monoton – es genügt, die Grenzen zu vergleichen.)
 */
export function agreedDigits(a: number, b: number): number {
  let best = -1;
  for (let k = 0; k <= 6; k++) if (roundTo(a, k) === roundTo(b, k)) best = k;
  return best;
}

/** Wie viele Nachkommastellen sind bei einem Intervall der Breite w sicher? */
export function safeDecimals(w: number): number {
  if (!(w > 0)) return 6;
  return Math.max(0, Math.min(6, Math.floor(-Math.log10(w))));
}
