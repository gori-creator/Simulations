/**
 * Rechenlogik „Funktionenscharen“ (Jgst. 12/13).
 *
 * Eine Schar f_k fasst viele Funktionen mit einem Parameter k zusammen.
 * Typische Fragen: Für welche k gibt es Extrempunkte? Wo liegen sie in
 * Abhängigkeit von k? Auf welcher Kurve (Ortskurve) wandern sie? Welche
 * Punkte haben alle Scharkurven gemeinsam? Wo liegen die Wendepunkte?
 *
 * Fünf Scharen:
 * - cub   f_k(x) = x³ − kx
 * - par   f_k(x) = x² − 2kx + k
 * - exp   f_k(x) = x · e^(−kx)
 * - quart f_k(x) = kx² − x⁴
 * - expk  f_k(x) = (x − k) · eˣ
 *
 * Neben den Punkten selbst stehen hier die „Äste“ (wie ein Extrem- oder
 * Wendepunkt mit k wandert und wie man k aus seiner x-Koordinate
 * zurückgewinnt), die Fallunterscheidung nach k und die Bedingung für
 * gemeinsame Punkte. Alles ohne Zeichencode, damit es testbar ist.
 */

export type FamKey = 'cub' | 'par' | 'exp' | 'quart' | 'expk';
export const FAM_KEYS: FamKey[] = ['cub', 'par', 'exp', 'quart', 'expk'];

/** Bereich des Parameters k in der Simulation. */
export const K_MIN = -3;
export const K_MAX = 3;

export interface Ext {
  x: number;
  y: number;
  kind: 'max' | 'min' | 'saddle';
}

/**
 * Ein Ast: ein Extrem- oder Wendepunkt, der stetig mit k wandert.
 * Gültig für k im offenen bzw. geschlossenen Bereich `dom`.
 */
export interface Branch {
  /** 'E': Extrempunkt (liegt auf der Ortskurve `locus`), 'W': Wendepunkt (auf `wlocus`) */
  curve: 'E' | 'W';
  /** Bereich von k: [von, bis, von offen?, bis offen?] */
  dom: [number, number, boolean, boolean];
  x: (k: number) => number;
  y: (k: number) => number;
  /** Art des Punktes (beim Extrempunkt Hoch- oder Tiefpunkt, ggf. abhängig von k) */
  kind: (k: number) => 'max' | 'min' | 'infl';
  /** k aus der x-Koordinate zurückgewinnen (Umkehrung von x(k)); null, wenn x nicht zum Ast passt */
  kOfX: (x: number) => number | null;
}

/** Ein Fall der Fallunterscheidung nach k. */
export interface CaseSeg {
  id: string;
  /** k-Bereich; bei `at` ein einzelner Wert */
  from: number;
  to: number;
  at?: number;
  /** Anzahl der Hochpunkte, Tiefpunkte, Terrassenpunkte */
  max: number;
  min: number;
  saddle: number;
}

export interface Family {
  f: (k: number, x: number) => number;
  /** Erste und zweite Ableitung nach x (exakt) */
  d1: (k: number, x: number) => number;
  d2: (k: number, x: number) => number;
  /** Extrempunkte in Abhängigkeit von k */
  extrema: (k: number) => Ext[];
  /** Ortskurve der Extrempunkte (y in Abhängigkeit von x) */
  locus: (x: number) => number;
  /** x-Werte, die auf der Ortskurve nicht erreicht werden (z. B. x = 0) */
  locusGaps: number[];
  /** gemeinsame Punkte aller Scharkurven */
  common: [number, number][];
  /**
   * Ist die Schar linear in k, also f_k(x) = a(x) + k · b(x), so ist
   * f_k₁(x) − f_k₂(x) = (k₁ − k₂) · b(x) – gemeinsame Punkte genau bei b(x) = 0.
   * null: nicht linear in k (dann gilt die Rechnung im Lernmaterial).
   */
  kCoef: ((x: number) => number) | null;
  /** Berühren sich alle Scharkurven im gemeinsamen Punkt (gleiche Steigung für alle k)? */
  touch: boolean;
  /** Wendepunkte in Abhängigkeit von k */
  inflections: (k: number) => { x: number; y: number }[];
  /** Ortskurve der Wendepunkte (null: keine oder nur ein fester Punkt) */
  wlocus: ((x: number) => number) | null;
  /** wandernde Extrem- und Wendepunkte */
  branches: Branch[];
  /** feste Punkte, die für einen ganzen k-Bereich an derselben Stelle liegen */
  fixed: { x: number; y: number; curve: 'E' | 'W'; dom: [number, number, boolean, boolean] }[];
  /** Fallunterscheidung (Extrempunkte) über [K_MIN; K_MAX] */
  cases: CaseSeg[];
}

const E = Math.E;
const sq = (v: number) => Math.sqrt(Math.max(0, v));

export const FAMS: Record<FamKey, Family> = {
  cub: {
    f: (k, x) => x ** 3 - k * x,
    d1: (k, x) => 3 * x * x - k,
    d2: (_k, x) => 6 * x,
    extrema: (k) => {
      if (k < 0) return [];
      if (k === 0) return [{ x: 0, y: 0, kind: 'saddle' }];
      const x = Math.sqrt(k / 3);
      return [
        { x: -x, y: (2 * k * x) / 3, kind: 'max' },
        { x, y: (-2 * k * x) / 3, kind: 'min' },
      ];
    },
    locus: (x) => -2 * x ** 3,
    locusGaps: [0],
    common: [[0, 0]],
    kCoef: (x) => -x,
    touch: false,
    // f″(x) = 6x: Wendepunkt immer im Ursprung
    inflections: () => [{ x: 0, y: 0 }],
    wlocus: null,
    branches: [
      { curve: 'E', dom: [0, K_MAX, true, false], x: (k) => -sq(k / 3), y: (k) => (2 * k * sq(k / 3)) / 3, kind: () => 'max', kOfX: (x) => (x < 0 ? 3 * x * x : null) },
      { curve: 'E', dom: [0, K_MAX, true, false], x: (k) => sq(k / 3), y: (k) => (-2 * k * sq(k / 3)) / 3, kind: () => 'min', kOfX: (x) => (x > 0 ? 3 * x * x : null) },
    ],
    fixed: [{ x: 0, y: 0, curve: 'W', dom: [K_MIN, K_MAX, false, false] }],
    cases: [
      { id: 'none', from: K_MIN, to: 0, max: 0, min: 0, saddle: 0 },
      { id: 'tp', from: 0, to: 0, at: 0, max: 0, min: 0, saddle: 1 },
      { id: 'ht', from: 0, to: K_MAX, max: 1, min: 1, saddle: 0 },
    ],
  },
  par: {
    f: (k, x) => x * x - 2 * k * x + k,
    d1: (k, x) => 2 * x - 2 * k,
    d2: () => 2,
    extrema: (k) => [{ x: k, y: k - k * k, kind: 'min' }],
    locus: (x) => x - x * x,
    locusGaps: [],
    common: [[0.5, 0.25]],
    kCoef: (x) => 1 - 2 * x,
    touch: false,
    inflections: () => [],
    wlocus: null,
    branches: [{ curve: 'E', dom: [K_MIN, K_MAX, false, false], x: (k) => k, y: (k) => k - k * k, kind: () => 'min', kOfX: (x) => x }],
    fixed: [],
    cases: [{ id: 't', from: K_MIN, to: K_MAX, max: 0, min: 1, saddle: 0 }],
  },
  exp: {
    f: (k, x) => x * Math.exp(-k * x),
    // f′(x) = (1 − kx) · e^(−kx), f″(x) = k · (kx − 2) · e^(−kx)
    d1: (k, x) => (1 - k * x) * Math.exp(-k * x),
    d2: (k, x) => k * (k * x - 2) * Math.exp(-k * x),
    extrema: (k) => (k === 0 ? [] : [{ x: 1 / k, y: 1 / (k * E), kind: k > 0 ? 'max' : 'min' }]),
    locus: (x) => x / E,
    locusGaps: [0],
    common: [[0, 0]],
    kCoef: null,
    touch: true,
    // f″(x) = k · e^(−kx) · (kx − 2): Wendepunkt (2/k | 2/(k e²))
    inflections: (k) => (k === 0 ? [] : [{ x: 2 / k, y: 2 / (k * E ** 2) }]),
    wlocus: (x) => x / E ** 2,
    branches: [
      { curve: 'E', dom: [K_MIN, 0, false, true], x: (k) => 1 / k, y: (k) => 1 / (k * E), kind: () => 'min', kOfX: (x) => (x < 0 ? 1 / x : null) },
      { curve: 'E', dom: [0, K_MAX, true, false], x: (k) => 1 / k, y: (k) => 1 / (k * E), kind: () => 'max', kOfX: (x) => (x > 0 ? 1 / x : null) },
      { curve: 'W', dom: [K_MIN, 0, false, true], x: (k) => 2 / k, y: (k) => 2 / (k * E ** 2), kind: () => 'infl', kOfX: (x) => (x < 0 ? 2 / x : null) },
      { curve: 'W', dom: [0, K_MAX, true, false], x: (k) => 2 / k, y: (k) => 2 / (k * E ** 2), kind: () => 'infl', kOfX: (x) => (x > 0 ? 2 / x : null) },
    ],
    fixed: [],
    cases: [
      { id: 't', from: K_MIN, to: 0, max: 0, min: 1, saddle: 0 },
      { id: 'none', from: 0, to: 0, at: 0, max: 0, min: 0, saddle: 0 },
      { id: 'h', from: 0, to: K_MAX, max: 1, min: 0, saddle: 0 },
    ],
  },
  quart: {
    f: (k, x) => k * x * x - x ** 4,
    d1: (k, x) => 2 * k * x - 4 * x ** 3,
    d2: (k, x) => 2 * k - 12 * x * x,
    extrema: (k) => {
      if (k <= 0) return [{ x: 0, y: 0, kind: 'max' }];
      const x = Math.sqrt(k / 2);
      const y = (k * k) / 4;
      return [
        { x: -x, y, kind: 'max' },
        { x: 0, y: 0, kind: 'min' },
        { x, y, kind: 'max' },
      ];
    },
    locus: (x) => x ** 4,
    locusGaps: [0],
    common: [[0, 0]],
    kCoef: (x) => x * x,
    touch: true,
    // f″(x) = 2k − 12x²: Wendepunkte (±√(k/6) | 5k²/36) für k > 0
    inflections: (k) => {
      if (k <= 0) return [];
      const x = Math.sqrt(k / 6);
      const y = (5 * k * k) / 36;
      return [
        { x: -x, y },
        { x, y },
      ];
    },
    wlocus: (x) => 5 * x ** 4,
    branches: [
      { curve: 'E', dom: [0, K_MAX, true, false], x: (k) => -sq(k / 2), y: (k) => (k * k) / 4, kind: () => 'max', kOfX: (x) => (x < 0 ? 2 * x * x : null) },
      { curve: 'E', dom: [0, K_MAX, true, false], x: (k) => sq(k / 2), y: (k) => (k * k) / 4, kind: () => 'max', kOfX: (x) => (x > 0 ? 2 * x * x : null) },
      { curve: 'W', dom: [0, K_MAX, true, false], x: (k) => -sq(k / 6), y: (k) => (5 * k * k) / 36, kind: () => 'infl', kOfX: (x) => (x < 0 ? 6 * x * x : null) },
      { curve: 'W', dom: [0, K_MAX, true, false], x: (k) => sq(k / 6), y: (k) => (5 * k * k) / 36, kind: () => 'infl', kOfX: (x) => (x > 0 ? 6 * x * x : null) },
    ],
    // (0 | 0): für k ≤ 0 Hochpunkt, für k > 0 Tiefpunkt – bleibt an seiner Stelle
    fixed: [{ x: 0, y: 0, curve: 'E', dom: [K_MIN, K_MAX, false, false] }],
    cases: [
      { id: 'h0', from: K_MIN, to: 0, max: 1, min: 0, saddle: 0 },
      { id: 'hth', from: 0, to: K_MAX, max: 2, min: 1, saddle: 0 },
    ],
  },
  // (x − k) · eˣ: Tiefpunkt (k − 1 | −e^(k−1)), Wendepunkt (k − 2 | −2e^(k−2)),
  // keine gemeinsamen Punkte – zwei Scharkurven unterscheiden sich überall um (k₂ − k₁) · eˣ ≠ 0
  expk: {
    f: (k, x) => (x - k) * Math.exp(x),
    d1: (k, x) => (x - k + 1) * Math.exp(x),
    d2: (k, x) => (x - k + 2) * Math.exp(x),
    extrema: (k) => [{ x: k - 1, y: -Math.exp(k - 1), kind: 'min' }],
    locus: (x) => -Math.exp(x),
    locusGaps: [],
    common: [],
    kCoef: (x) => -Math.exp(x),
    touch: false,
    inflections: (k) => [{ x: k - 2, y: -2 * Math.exp(k - 2) }],
    wlocus: (x) => -2 * Math.exp(x),
    branches: [
      { curve: 'E', dom: [K_MIN, K_MAX, false, false], x: (k) => k - 1, y: (k) => -Math.exp(k - 1), kind: () => 'min', kOfX: (x) => x + 1 },
      { curve: 'W', dom: [K_MIN, K_MAX, false, false], x: (k) => k - 2, y: (k) => -2 * Math.exp(k - 2), kind: () => 'infl', kOfX: (x) => x + 2 },
    ],
    fixed: [],
    cases: [{ id: 't', from: K_MIN, to: K_MAX, max: 0, min: 1, saddle: 0 }],
  },
};

/* ---------------- Äste ---------------- */

/** Liegt k im Gültigkeitsbereich eines Astes? */
export function inDom(dom: [number, number, boolean, boolean], k: number): boolean {
  const [a, b, ao, bo] = dom;
  if (k < a || k > b) return false;
  if (ao && k === a) return false;
  if (bo && k === b) return false;
  return true;
}

/**
 * x-Bereich, den ein Ast überstreicht, wenn k das Intervall [lo; hi]
 * durchläuft (alle Äste sind in k monoton). Ein offenes Ende am Rand des
 * Gültigkeitsbereichs (z. B. k → 0 bei x = 1/k) liefert ±Infinity bzw. den
 * Grenzwert. null: kein Überlapp.
 */
export function branchXRange(b: Branch, lo: number, hi: number): [number, number] | null {
  const [a, c, ao, co] = b.dom;
  const l = Math.max(lo, a);
  const h = Math.min(hi, c);
  if (l > h) return null;
  if (l === h && ((ao && l === a) || (co && h === c))) return null;
  const at = (k: number, open: boolean) => {
    if (!open) return b.x(k);
    // offenes Ende: knapp daneben auswerten (Grenzwert)
    const eps = 1e-9;
    return b.x(k === a ? k + eps : k - eps);
  };
  const xl = at(l, ao && l === a);
  const xh = at(h, co && h === c);
  return xl <= xh ? [xl, xh] : [xh, xl];
}

/**
 * k-Wert auf dem Ast, dessen Punkt dem Zielpunkt (in beliebigen
 * Maßeinheiten, sx/sy: Pixel je Einheit) am nächsten liegt – zum Ziehen
 * eines Extrempunktes entlang seiner Ortskurve. Grob abtasten, dann
 * verfeinern.
 */
export function nearestK(b: Branch, tx: number, ty: number, sx = 1, sy = 1, lo = K_MIN, hi = K_MAX): number | null {
  const l = Math.max(lo, b.dom[0]);
  const h = Math.min(hi, b.dom[1]);
  if (l > h) return null;
  const d = (k: number) => {
    const x = b.x(k);
    const y = b.y(k);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return Infinity;
    return Math.hypot((x - tx) * sx, (y - ty) * sy);
  };
  const N = 600;
  let best = NaN;
  let bd = Infinity;
  for (let i = 0; i <= N; i++) {
    const k = l + ((h - l) * i) / N;
    if (!inDom(b.dom, k)) continue;
    const v = d(k);
    if (v < bd) {
      bd = v;
      best = k;
    }
  }
  if (!Number.isFinite(best)) return null;
  // Verfeinern (goldener Schnitt in der Umgebung)
  let a = Math.max(l, best - (h - l) / N);
  let c = Math.min(h, best + (h - l) / N);
  for (let i = 0; i < 40; i++) {
    const m1 = a + (c - a) * 0.382;
    const m2 = a + (c - a) * 0.618;
    if (d(m1) <= d(m2)) c = m2;
    else a = m1;
  }
  const k = (a + c) / 2;
  return inDom(b.dom, k) ? k : best;
}

/* ---------------- Fallunterscheidung ---------------- */

/** Fall der Fallunterscheidung, in dem k liegt (Sonderwert `at` zuerst). */
export function caseAt(fam: Family, k: number, tol = 1e-9): CaseSeg {
  for (const c of fam.cases) if (c.at !== undefined && Math.abs(k - c.at) <= tol) return c;
  for (const c of fam.cases) if (c.at === undefined && k >= c.from - tol && k <= c.to + tol) return c;
  return fam.cases[fam.cases.length - 1]!;
}

/** Index des Falls (für die Hervorhebung in der Karte). */
export function caseIndex(fam: Family, k: number, tol = 1e-9): number {
  return fam.cases.indexOf(caseAt(fam, k, tol));
}

/* ---------------- Durchlauf von k ---------------- */

/**
 * „k durchlaufen lassen“: von k₀ zuerst nach K_MIN, dann bis K_MAX und
 * zurück zu k₀. t ∈ [0; 1] ist der Anteil am ganzen Weg; die Geschwindigkeit
 * ist überall gleich.
 */
export function sweepK(t: number, k0: number, lo = K_MIN, hi = K_MAX): number {
  const a = Math.abs(k0 - lo);
  const b = hi - lo;
  const c = hi - k0;
  const s = Math.max(0, Math.min(1, t)) * (a + b + c);
  if (s < a) return k0 - s;
  if (s < a + b) return lo + (s - a);
  return hi - (s - a - b);
}

/** Länge des Weges eines Durchlaufs (in k-Einheiten). */
export function sweepLength(k0: number, lo = K_MIN, hi = K_MAX): number {
  return Math.abs(k0 - lo) + (hi - lo) + (hi - k0);
}

/**
 * Pendeln beim Abspielen: k läuft mit der Richtung dir (±1) weiter und
 * kehrt an den Rändern um. Liefert neues k und neue Richtung.
 */
export function bounceK(k: number, dir: 1 | -1, dk: number, lo = K_MIN, hi = K_MAX): { k: number; dir: 1 | -1 } {
  let v = k + dir * dk;
  let d = dir;
  for (let i = 0; i < 4 && (v > hi || v < lo); i++) {
    if (v > hi) {
      v = 2 * hi - v;
      d = -1;
    } else if (v < lo) {
      v = 2 * lo - v;
      d = 1;
    }
  }
  return { k: Math.max(lo, Math.min(hi, v)), dir: d };
}

/* ---------------- Prüfhilfen ---------------- */

/** Numerische zweite Ableitung (zum Prüfen). */
export function curvature(fam: Family, k: number, x: number, h = 1e-4): number {
  return (fam.f(k, x + h) - 2 * fam.f(k, x) + fam.f(k, x - h)) / (h * h);
}

/** Schnittstellen zweier Scharkurven f_k1 und f_k2 im Intervall (numerisch, Vorzeichenwechsel). */
export function intersections(fam: Family, k1: number, k2: number, from: number, to: number, steps = 2000): number[] {
  const d = (x: number) => fam.f(k1, x) - fam.f(k2, x);
  const out: number[] = [];
  const h = (to - from) / steps;
  let x0 = from;
  let d0 = d(x0);
  for (let i = 1; i <= steps; i++) {
    const x1 = from + i * h;
    const d1 = d(x1);
    if (d0 === 0) out.push(x0);
    else if (d0 * d1 < 0) {
      let a = x0;
      let b = x1;
      for (let j = 0; j < 60; j++) {
        const m = (a + b) / 2;
        if (d(a) * d(m) <= 0) b = m;
        else a = m;
      }
      out.push((a + b) / 2);
    }
    x0 = x1;
    d0 = d1;
  }
  return out;
}

/** Numerische Ableitung (zum Prüfen). */
export function slope(fam: Family, k: number, x: number, h = 1e-6): number {
  return (fam.f(k, x + h) - fam.f(k, x - h)) / (2 * h);
}

/**
 * Art eines Punktes mit f′(x₀) = 0 über den Vorzeichenwechsel von f′:
 * + → − Hochpunkt, − → + Tiefpunkt, sonst Terrassenpunkt.
 */
export function kindBySign(fam: Family, k: number, x0: number, h = 1e-3): 'max' | 'min' | 'saddle' {
  const l = fam.d1(k, x0 - h);
  const r = fam.d1(k, x0 + h);
  if (l > 0 && r < 0) return 'max';
  if (l < 0 && r > 0) return 'min';
  return 'saddle';
}

/** Hilfswerte für Anzeigen: Wert sehr nahe an einer ganzen oder „runden“ Zahl? */
export function isNice(v: number, d = 2): boolean {
  return Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7 * Math.max(1, Math.abs(v * 10 ** d));
}
