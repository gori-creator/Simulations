/**
 * Rechenlogik „Grenzverhalten und Asymptoten“ (Jahrgangsstufe 11).
 *
 * Verhalten von f(x) für x → +∞ bzw. x → −∞:
 * - f(x) → L (Grenzwert L): Die Gerade y = L ist waagrechte Asymptote.
 *   Anschaulich (ε-Schlauch): Zu jedem noch so schmalen Schlauch
 *   L − ε < y < L + ε gibt es eine Stelle x_ε, ab der der Graph den
 *   Schlauch nicht mehr verlässt.
 * - f(x) → +∞ bzw. −∞ (bestimmte Divergenz): kein Grenzwert, der Graph
 *   verlässt jeden Schlauch; dafür gibt es zu jeder Schranke S eine Stelle,
 *   ab der f(x) > S (bzw. f(x) < S) bleibt.
 *
 * Alle Funktionen sind fest gewählt und so ausgesucht, dass die Werte im
 * Unterricht von Hand nachgerechnet werden können (z. B. x_ε = 1 + 3/ε).
 */

export type FnKey = 'inv' | 'rat' | 'rat2' | 'low' | 'osc' | 'exp' | 'xexp' | 'logi' | 'poly';
export type Dir = 1 | -1;
/** Lage des Graphen gegenüber der Asymptote „weit draußen“. */
export type Side = 'above' | 'below' | 'both';
/** Art der Funktion (für die erklärende Karte). */
export type Family = 'rational' | 'osc' | 'exp';

export const FN_KEYS: readonly FnKey[] = ['inv', 'rat', 'rat2', 'low', 'osc', 'exp', 'xexp', 'logi', 'poly'];

/** Grenzverhalten: Zahl (Grenzwert) oder ±Infinity (bestimmt divergent). */
export interface FnDef {
  f: (x: number) => number;
  /** Verhalten für x → +∞ */
  plus: number;
  /** Verhalten für x → −∞ */
  minus: number;
  /** Definitionslücken (Polstellen) */
  poles: number[];
  family: Family;
  /** Gebrochen-rational: Koeffizienten von Zähler und Nenner, aufsteigend (c₀ + c₁x + …) */
  ratio?: { num: number[]; den: number[] };
}

export const FUNCS: Record<FnKey, FnDef> = {
  // 1/x + 1 = (x + 1)/x → 1
  inv: { f: (x) => (x === 0 ? NaN : 1 / x + 1), plus: 1, minus: 1, poles: [0], family: 'rational', ratio: { num: [1, 1], den: [0, 1] } },
  // (2x + 1)/(x − 1) = 2 + 3/(x − 1) → 2
  rat: { f: (x) => (x === 1 ? NaN : (2 * x + 1) / (x - 1)), plus: 2, minus: 2, poles: [1], family: 'rational', ratio: { num: [1, 2], den: [-1, 1] } },
  // (3x² + 1)/(x² + 1) = 3 − 2/(x² + 1) → 3
  rat2: { f: (x) => (3 * x * x + 1) / (x * x + 1), plus: 3, minus: 3, poles: [], family: 'rational', ratio: { num: [1, 0, 3], den: [1, 0, 1] } },
  // 2x/(x² + 1) → 0 (Zählergrad kleiner als Nennergrad)
  low: { f: (x) => (2 * x) / (x * x + 1), plus: 0, minus: 0, poles: [], family: 'rational', ratio: { num: [0, 2], den: [1, 0, 1] } },
  // sin(x)/x → 0 (der Graph schneidet die Asymptote immer wieder)
  osc: { f: (x) => (x === 0 ? 1 : Math.sin(x) / x), plus: 0, minus: 0, poles: [], family: 'osc' },
  // 2^x → +∞ bzw. → 0
  exp: { f: (x) => 2 ** x, plus: Infinity, minus: 0, poles: [], family: 'exp' },
  // x · 2^(−x) → 0 für x → +∞ (die Exponentialfunktion „gewinnt“), → −∞ für x → −∞
  xexp: { f: (x) => x * 2 ** -x, plus: 0, minus: -Infinity, poles: [], family: 'exp' },
  // 2^x/(2^x + 1) = 1/(1 + 2^(−x)) → 1 bzw. → 0 (zwei verschiedene Asymptoten)
  logi: { f: (x) => 1 / (1 + 2 ** -x), plus: 1, minus: 0, poles: [], family: 'exp' },
  // 0,1x³ − x → ±∞
  poly: { f: (x) => 0.1 * x ** 3 - x, plus: Infinity, minus: -Infinity, poles: [], family: 'rational', ratio: { num: [0, -1, 0, 0.1], den: [1] } },
};

export function limitOf(key: FnKey, dir: Dir): number {
  return dir > 0 ? FUNCS[key].plus : FUNCS[key].minus;
}

export function hasLimit(key: FnKey, dir: Dir): boolean {
  return Number.isFinite(limitOf(key, dir));
}

/**
 * Stelle x_ε (in Richtung dir): Für alle x jenseits von x_ε gilt
 * |f(x) − L| < ε. Numerisch: Von weit draußen (dort gilt die Bedingung) nach
 * innen wandern bis zur ersten Verletzung und dort fein eingrenzen.
 * Rückgabe in Richtung dir gemessen (x_ε selbst, mit Vorzeichen); gesucht wird
 * nur auf der Seite von dir (|x_ε| ≥ 0). Gilt die Bedingung schon ab 0, ist das
 * Ergebnis 0.
 */
export function threshold(key: FnKey, dir: Dir, eps: number, far = 0): number {
  const L = limitOf(key, dir);
  if (!Number.isFinite(L)) return NaN;
  const f = FUNCS[key].f;
  const bad = (t: number) => {
    const v = f(dir * t);
    return !Number.isFinite(v) || Math.abs(v - L) >= eps;
  };
  // weit genug draußen: alle hier untersuchten Funktionen nähern sich höchstens wie 3/|x|
  const hi = Math.max(far, 20 / eps + 10);
  const n = 400000;
  const h = hi / n;
  for (let i = n; i >= 0; i--) {
    const t = i * h;
    if (bad(t)) {
      // feiner zwischen t und t + h
      let lo = t;
      let up = t + h;
      for (let k = 0; k < 50; k++) {
        const m = (lo + up) / 2;
        if (bad(m)) lo = m;
        else up = m;
      }
      return dir * up;
    }
  }
  return 0;
}

/**
 * x_ε in geschlossener Form, wo es eine gibt (sonst NaN). Anders als
 * `threshold` ist das die genaue Grenze, auch wenn sie auf der „falschen“ Seite
 * von 0 liegt (z. B. bei 2ˣ/(2ˣ + 1) und großem ε); ±Infinity heißt: Die
 * Bedingung gilt für alle x.
 *
 * - 1/x + 1:            1/|x| < ε            ⇔ |x| > 1/ε
 * - (2x + 1)/(x − 1):   3/|x − 1| < ε        ⇔ x > 1 + 3/ε  bzw.  x < 1 − 3/ε
 * - 3 − 2/(x² + 1):     2/(x² + 1) < ε       ⇔ |x| > √(2/ε − 1)
 * - 2x/(x² + 1):        2|x|/(x² + 1) < ε    ⇔ |x| > (1 + √(1 − ε²))/ε
 * - 2ˣ (x → −∞):        2ˣ < ε               ⇔ x < log₂ ε
 * - 1/(1 + 2⁻ˣ) (+∞):   1/(2ˣ + 1) < ε       ⇔ x > log₂(1/ε − 1)
 * - 1/(1 + 2⁻ˣ) (−∞):   2ˣ/(2ˣ + 1) < ε      ⇔ x < log₂(ε/(1 − ε))
 */
export function exactThreshold(key: FnKey, dir: Dir, eps: number): number {
  if (!hasLimit(key, dir) || !(eps > 0)) return NaN;
  switch (key) {
    case 'inv':
      return dir / eps;
    case 'rat':
      return dir > 0 ? 1 + 3 / eps : 1 - 3 / eps;
    case 'rat2':
      return eps >= 2 ? -dir * Infinity : dir * Math.sqrt(2 / eps - 1);
    case 'low':
      return eps > 1 ? -dir * Infinity : (dir * (1 + Math.sqrt(1 - eps * eps))) / eps;
    case 'exp':
      return Math.log2(eps);
    case 'logi':
      if (eps >= 1) return -dir * Infinity;
      return dir > 0 ? Math.log2(1 / eps - 1) : Math.log2(eps / (1 - eps));
    default:
      return NaN;
  }
}

/** Stelle, an der die Abschätzung |sin x / x| ≤ 1/|x| < ε sicher greift (|x| > 1/ε). */
export function boundThreshold(eps: number): number {
  return 1 / eps;
}

/**
 * Lage des Graphen gegenüber der Asymptote für große |x|: 'above' (f(x) > L),
 * 'below' (f(x) < L) oder 'both' (schwingt um L). Bei bestimmter Divergenz null.
 * Numerisch über viele Stichproben weit draußen.
 */
export function approachSide(key: FnKey, dir: Dir): Side | null {
  if (!hasLimit(key, dir)) return null;
  const L = limitOf(key, dir);
  const f = FUNCS[key].f;
  const [a, b] = FUNCS[key].family === 'exp' ? [6, 60] : [30, 30000];
  let pos = 0;
  let neg = 0;
  const n = 997;
  for (let i = 0; i <= n; i++) {
    const t = a * (b / a) ** (i / n);
    const d = f(dir * t) - L;
    if (d > 0) pos++;
    else if (d < 0) neg++;
  }
  if (pos && neg) return 'both';
  return pos ? 'above' : 'below';
}

/* ---------- Gebrochen-rationale Funktionen: Zählergrad und Nennergrad ---------- */

export type DegreeCase = 'lt' | 'eq' | 'gt';
export interface DegreeInfo {
  /** Grad des Zählers */
  zDeg: number;
  /** Grad des Nenners */
  nDeg: number;
  /** Leitkoeffizient des Zählers */
  zLead: number;
  /** Leitkoeffizient des Nenners */
  nLead: number;
  case: DegreeCase;
}

/** Grad (höchste Potenz mit Koeffizient ≠ 0) eines Polynoms in aufsteigender Darstellung. */
export function polyDegree(c: readonly number[]): number {
  for (let k = c.length - 1; k >= 0; k--) if (c[k] !== 0) return k;
  return -Infinity;
}
export function polyEval(c: readonly number[], x: number): number {
  let v = 0;
  for (let k = c.length - 1; k >= 0; k--) v = v * x + c[k]!;
  return v;
}

/** Zählergrad und Nennergrad (nur für gebrochen-rationale bzw. ganzrationale Funktionen). */
export function degreeInfo(key: FnKey): DegreeInfo | null {
  const r = FUNCS[key].ratio;
  if (!r) return null;
  const zDeg = polyDegree(r.num);
  const nDeg = polyDegree(r.den);
  return { zDeg, nDeg, zLead: r.num[zDeg]!, nLead: r.den[nDeg]!, case: zDeg < nDeg ? 'lt' : zDeg === nDeg ? 'eq' : 'gt' };
}

/**
 * Grenzverhalten nach der Gradregel:
 * Grad Z < Grad N → 0; Grad Z = Grad N → Quotient der Leitkoeffizienten;
 * Grad Z > Grad N → ±∞ (Vorzeichen aus dem Quotienten der Leitkoeffizienten
 * und, für x → −∞, der Parität von Grad Z − Grad N).
 */
export function degreeRuleLimit(d: DegreeInfo, dir: Dir): number {
  if (d.case === 'lt') return 0;
  const q = d.zLead / d.nLead;
  if (d.case === 'eq') return q;
  const sgn = Math.sign(q) * (dir < 0 && (d.zDeg - d.nDeg) % 2 === 1 ? -1 : 1);
  return sgn * Infinity;
}

/* ---------- Bestimmte Divergenz ---------- */

/**
 * Probe-Schlauch um einen vermuteten Grenzwert c (bei bestimmter Divergenz):
 * die Stelle, ab der der Graph den Schlauch c − ε < y < c + ε für immer
 * verlässt (letzte Stelle im Schlauch, in Richtung dir). NaN, wenn der Graph
 * auf dieser Seite (|x| ≥ 0) nie im Schlauch liegt.
 */
export function leavePoint(key: FnKey, dir: Dir, c: number, eps: number): number {
  const f = FUNCS[key].f;
  const inside = (t: number) => {
    const v = f(dir * t);
    return Number.isFinite(v) && Math.abs(v - c) < eps;
  };
  // weit genug draußen: |f| deutlich größer als |c| + ε
  let hi = 1;
  while (hi < 1e6 && !(Math.abs(f(dir * hi)) > Math.abs(c) + eps + 1)) hi *= 2;
  const n = 40000;
  const h = hi / n;
  for (let i = n; i >= 0; i--) {
    const t = i * h;
    if (inside(t)) {
      let lo = t;
      let up = t + h;
      for (let k = 0; k < 60; k++) {
        const m = (lo + up) / 2;
        if (inside(m)) lo = m;
        else up = m;
      }
      return dir * lo;
    }
  }
  return NaN;
}

/**
 * Schranke S bei bestimmter Divergenz: die Stelle, ab der f(x) > S bleibt
 * (f → +∞) bzw. f(x) < S bleibt (f → −∞), in Richtung dir; 0, wenn das schon
 * ab x = 0 gilt. NaN bei Funktionen mit Grenzwert.
 */
export function exceedPoint(key: FnKey, dir: Dir, S: number): number {
  const lim = limitOf(key, dir);
  if (Number.isFinite(lim)) return NaN;
  const f = FUNCS[key].f;
  const s = Math.sign(lim);
  const ok = (t: number) => s * f(dir * t) > s * S;
  let hi = 1;
  while (hi < 1e6 && !ok(hi)) hi *= 2;
  const n = 40000;
  const h = hi / n;
  for (let i = n; i >= 0; i--) {
    const t = i * h;
    if (!ok(t)) {
      let lo = t;
      let up = t + h;
      for (let k = 0; k < 60; k++) {
        const m = (lo + up) / 2;
        if (ok(m)) up = m;
        else lo = m;
      }
      return dir * up;
    }
  }
  return 0;
}

/** Vorschlag für den Probe-Schlauch (vermuteter Grenzwert) bei bestimmter Divergenz. */
export function candidateDefault(key: FnKey, dir: Dir): number {
  const lim = limitOf(key, dir);
  if (Number.isFinite(lim)) return 3;
  return lim > 0 ? (key === 'exp' ? 4 : 3) : -3;
}

/* ---------- Wertetabelle und Lauf nach außen ---------- */

/** Stellen für die Wertetabelle: x = ±1, ±10, ±100, … (bei Exponentialfunktionen kleinere Schritte). */
export function tableXs(key: FnKey): number[] {
  return FUNCS[key].family === 'exp' ? [1, 2, 5, 10, 20] : [1, 10, 100, 1000, 10000];
}

/** Werte für die Tabelle (Definitionslücken ergeben NaN). */
export function table(key: FnKey, dir: Dir, xs = tableXs(key)): { x: number; y: number; d: number }[] {
  const L = limitOf(key, dir);
  return xs.map((ax) => {
    const x = dir * ax;
    const y = FUNCS[key].f(x);
    return { x, y, d: Number.isFinite(L) ? Math.abs(y - L) : NaN };
  });
}

/**
 * Bereich des Laufs „x läuft nach außen“ als Beträge |x|: von der ersten bis
 * zur letzten Tabellenstelle (bei (2x + 1)/(x − 1) für x → +∞ erst ab 2,
 * weil x = 1 Definitionslücke ist).
 */
export function runSpan(key: FnKey, dir: Dir): { from: number; to: number } {
  const xs = tableXs(key);
  const from = key === 'rat' && dir > 0 ? 2 : xs[0]!;
  return { from, to: xs[xs.length - 1]! };
}
/** Stelle des Laufs bei Fortschritt u ∈ [0; 1] (logarithmisch: gleiche Zeit je Zehnerpotenz). */
export function runX(key: FnKey, dir: Dir, u: number): number {
  const { from, to } = runSpan(key, dir);
  const k = Math.min(1, Math.max(0, u));
  return dir * from * (to / from) ** k;
}
/** Umkehrung von runX: Fortschritt u zur Stelle x (auf [0; 1] begrenzt). */
export function runU(key: FnKey, dir: Dir, x: number): number {
  const { from, to } = runSpan(key, dir);
  const t = Math.max(from, Math.abs(x));
  return Math.min(1, Math.max(0, Math.log(t / from) / Math.log(to / from)));
}

/**
 * Grundausschnitt in y-Richtung (ohne Lauf): Asymptote, Schlauch bis ε = 1
 * und der interessante Teil des Graphen gut sichtbar.
 */
export function yWindow(key: FnKey, dir: Dir): [number, number] {
  switch (key) {
    case 'inv':
      return [-2, 4];
    case 'rat':
      return [-2, 7];
    case 'rat2':
      return [-0.5, 4.5];
    case 'low':
      return [-1.6, 1.8];
    case 'osc':
      return [-1.2, 1.4];
    case 'exp':
      return dir > 0 ? [-2, 12] : [-1.4, 4.4];
    case 'xexp':
      return dir > 0 ? [-1.3, 1.6] : [-12, 3];
    case 'logi':
      return [-0.6, 1.9];
    case 'poly':
      return dir > 0 ? [-6, 10] : [-10, 6];
  }
}

/** Abstand |f(x) − L| (NaN bei Divergenz oder Definitionslücke). */
export function distance(key: FnKey, dir: Dir, x: number): number {
  const L = limitOf(key, dir);
  const v = FUNCS[key].f(x);
  return Number.isFinite(L) && Number.isFinite(v) ? Math.abs(v - L) : NaN;
}

/** Nächstes ε im „ε-Spiel“ (1 → 0,5 → 0,25 → 0,1 → 0,05 → wieder 1). */
export const EPS_STEPS: readonly number[] = [1, 0.5, 0.25, 0.1, 0.05];
export function nextEps(eps: number): number {
  for (const e of EPS_STEPS) if (e < eps - 1e-9) return e;
  return EPS_STEPS[0]!;
}

/** Zerlegung in Mantisse und Zehnerexponent (z. B. 3,03 · 10⁻⁴). */
export function sciSplit(v: number): { mant: number; exp: number } {
  if (v === 0 || !Number.isFinite(v)) return { mant: v, exp: 0 };
  let exp = Math.floor(Math.log10(Math.abs(v)));
  let mant = v / 10 ** exp;
  // Rundung auf zwei Nachkommastellen darf nicht 10,00 ergeben
  if (Math.abs(Math.round(mant * 100) / 100) >= 10) {
    exp += 1;
    mant /= 10;
  }
  return { mant, exp };
}
