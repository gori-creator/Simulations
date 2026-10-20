/**
 * Rechenlogik „Graphen verschieben, strecken und spiegeln“ (Jahrgangsstufe 11).
 *
 *   g(x) = a · f(b · (x − c)) + d
 *
 * Wirkung auf den Graphen von f (in dieser Reihenfolge ausführbar):
 * 1. b: Streckung in x-Richtung mit dem Faktor 1/b (|b| > 1: Stauchung),
 *       b < 0 zusätzlich Spiegelung an der y-Achse,
 * 2. c: Verschiebung um c in x-Richtung (c > 0: nach rechts),
 * 3. a: Streckung in y-Richtung mit dem Faktor a (|a| < 1: Stauchung),
 *       a < 0 zusätzlich Spiegelung an der x-Achse,
 * 4. d: Verschiebung um d in y-Richtung.
 *
 * Ein Punkt (x | y) des Graphen von f geht dabei über in (x/b + c | a·y + d).
 *
 * Für die Animation wird jede Zwischenstufe als „affine Lage“ beschrieben:
 * Ein Punkt (u | v) von f liegt dann bei (s·u + h | a·v + d). Für g ist s = 1/b
 * und h = c. So lassen sich auch Zwischenstufen wie f(bx − c) (erst verschieben,
 * dann strecken) und das „Umklappen“ bei einer Spiegelung (s läuft durch 0)
 * ohne Division durch 0 darstellen.
 */

export type Base = 'sq' | 'cub' | 'sqrt' | 'abs' | 'inv' | 'sin' | 'exp';
export const BASE_KINDS: readonly Base[] = ['sq', 'cub', 'sqrt', 'abs', 'inv', 'sin', 'exp'];

export interface Trafo {
  a: number;
  b: number;
  c: number;
  d: number;
}

export const IDENTITY: Trafo = { a: 1, b: 1, c: 0, d: 0 };

/** Grundfunktion f. */
export function base(kind: Base, x: number): number {
  switch (kind) {
    case 'sq':
      return x * x;
    case 'cub':
      return x * x * x;
    case 'sqrt':
      return x >= 0 ? Math.sqrt(x) : NaN;
    case 'abs':
      return Math.abs(x);
    case 'inv':
      return x === 0 ? NaN : 1 / x;
    case 'sin':
      return Math.sin(x);
    case 'exp':
      return 2 ** x;
  }
}

/** g(x) = a · f(b(x − c)) + d */
export function transformed(kind: Base, t: Trafo, x: number): number {
  return t.a * base(kind, t.b * (x - t.c)) + t.d;
}

/** Bildpunkt eines Punktes (x | y) des Graphen von f. */
export function mapPoint(t: Trafo, x: number, y: number): [number, number] {
  return [x / t.b + t.c, t.a * y + t.d];
}

/** Urbild (zum Ziehen): Welcher Punkt von f geht auf (X | Y)? (nur für a ≠ 0, b ≠ 0) */
export function unmapPoint(t: Trafo, X: number, Y: number): [number, number] {
  return [t.b * (X - t.c), (Y - t.d) / t.a];
}

/** Markante Punkte von f (werden mit abgebildet). */
export function keyPoints(kind: Base): [number, number][] {
  switch (kind) {
    case 'sq':
      return [
        [-2, 4],
        [-1, 1],
        [0, 0],
        [1, 1],
        [2, 4],
      ];
    case 'cub':
      return [
        [-1, -1],
        [0, 0],
        [1, 1],
      ];
    case 'sqrt':
      return [
        [0, 0],
        [1, 1],
        [4, 2],
      ];
    case 'abs':
      return [
        [-2, 2],
        [0, 0],
        [2, 2],
      ];
    case 'inv':
      return [
        [-1, -1],
        [1, 1],
        [2, 0.5],
      ];
    case 'sin':
      return [
        [0, 0],
        [Math.PI / 2, 1],
        [Math.PI, 0],
        [(3 * Math.PI) / 2, -1],
      ];
    case 'exp':
      return [
        [-1, 0.5],
        [0, 1],
        [1, 2],
      ];
  }
}

/**
 * Ankerpunkt (zum Verschieben) und Formpunkt (zum Strecken) von f.
 * Der Ankerpunkt ist immer der Ursprung: Sein Bild ist (c | d). Bei Parabel,
 * Betrag, Wurzel, kubischer Parabel und Sinus liegt er auf dem Graphen
 * (Scheitel, Knick, Anfangspunkt, Symmetriezentrum), bei der Hyperbel ist er
 * das Symmetriezentrum, bei der Exponentialfunktion liegt er auf der Asymptote.
 */
export function anchors(kind: Base): { p0: [number, number]; p1: [number, number] } {
  switch (kind) {
    case 'sin':
      return { p0: [0, 0], p1: [Math.PI / 2, 1] };
    case 'exp':
      return { p0: [0, 0], p1: [1, 2] };
    default:
      return { p0: [0, 0], p1: [1, 1] };
  }
}

/**
 * Parameter aus der Lage des Formpunkts (Bild von p1) bei festem c und d.
 * Liefert null, wenn die Lage keinen Wert für b zulässt (senkrecht über dem Anker).
 */
export function formFromPoint(kind: Base, c: number, d: number, X: number, Y: number): { a: number; b: number | null } {
  const [u1, v1] = anchors(kind).p1;
  const a = (Y - d) / v1;
  const dx = X - c;
  return { a, b: Math.abs(dx) < 1e-9 ? null : u1 / dx };
}

/** Waagrechte bzw. senkrechte Asymptoten von g (falls vorhanden). */
export function asymptotes(kind: Base, t: Trafo): { x?: number; y?: number } {
  if (kind === 'inv') return { x: t.c, y: t.d };
  if (kind === 'exp') return { y: t.d };
  return {};
}

/**
 * Zwischenstufen der Schritt-für-Schritt-Darstellung:
 * f → f(bx) → f(b(x − c)) → a·f(b(x − c)) → a·f(b(x − c)) + d.
 */
export function stages(t: Trafo): Trafo[] {
  return [
    { ...IDENTITY },
    { a: 1, b: t.b, c: 0, d: 0 },
    { a: 1, b: t.b, c: t.c, d: 0 },
    { a: t.a, b: t.b, c: t.c, d: 0 },
    { ...t },
  ];
}

/* ------------------------------------------------------------------ */
/* Affine Lagen (für die Animation)                                    */
/* ------------------------------------------------------------------ */

/** Lage eines Bildgraphen: (u | v) von f liegt bei (s·u + h | a·v + d). */
export interface Affine {
  a: number;
  s: number;
  h: number;
  d: number;
}

export const AFFINE_ID: Affine = { a: 1, s: 1, h: 0, d: 0 };

/** Lage von g = a·f(b(x − c)) + d. */
export function toAffine(t: Trafo): Affine {
  return { a: t.a, s: 1 / t.b, h: t.c, d: t.d };
}

/** Umkehrung von toAffine (nur für s ≠ 0). */
export function fromAffine(A: Affine): Trafo {
  return { a: A.a, b: 1 / A.s, c: A.h, d: A.d };
}

export function mapAffine(A: Affine, u: number, v: number): [number, number] {
  return [A.s * u + A.h, A.a * v + A.d];
}

export function lerpAffine(A: Affine, B: Affine, k: number): Affine {
  return { a: A.a + (B.a - A.a) * k, s: A.s + (B.s - A.s) * k, h: A.h + (B.h - A.h) * k, d: A.d + (B.d - A.d) * k };
}

/** Funktionswert des Bildgraphen in affiner Lage (für s ≠ 0). */
export function affineValue(kind: Base, A: Affine, x: number): number {
  return A.a * base(kind, (x - A.h) / A.s) + A.d;
}

/** Reihenfolge der Schritte: richtig (erst strecken, dann verschieben) oder vertauscht. */
export type Order = 'std' | 'swap';
/** Parameter, der in Stufe 1 … 4 wirkt. */
export type StepKey = 'a' | 'b' | 'c' | 'd';

export function stepKeys(order: Order): StepKey[] {
  return order === 'std' ? ['b', 'c', 'a', 'd'] : ['c', 'b', 'a', 'd'];
}

/**
 * Die fünf Lagen der Schrittfolge. Eingabe ist die Lage von g (a, s = 1/b, h = c, d).
 * - std:  f → f(bx) → f(b(x − c)) → a·f(b(x − c)) → … + d (endet genau bei g)
 * - swap: f → f(x − c) → f(bx − c) → a·f(bx − c) → … + d
 *   Das Strecken in x-Richtung wirkt auf die schon verschobene Kurve: Die
 *   Verschiebung schrumpft mit auf c/b. Ergebnis ist a·f(b(x − c/b)) + d ≠ g.
 */
export function stageAffines(g: Affine, order: Order = 'std'): Affine[] {
  const { a, s, h: c, d } = g;
  if (order === 'std')
    return [
      { ...AFFINE_ID },
      { a: 1, s, h: 0, d: 0 },
      { a: 1, s, h: c, d: 0 },
      { a, s, h: c, d: 0 },
      { a, s, h: c, d },
    ];
  return [
    { ...AFFINE_ID },
    { a: 1, s: 1, h: c, d: 0 },
    { a: 1, s, h: c * s, d: 0 },
    { a, s, h: c * s, d: 0 },
    { a, s, h: c * s, d },
  ];
}

/** Ergebnis der vertauschten Reihenfolge als Term in Standardform: a·f(bx − c) + d = a·f(b(x − c/b)) + d. */
export function swappedResult(t: Trafo): Trafo {
  return { a: t.a, b: t.b, c: t.c / t.b, d: t.d };
}

/**
 * Lage auf der Zeitleiste: tl ∈ [0; 4], ganzzahlig = nach der jeweiligen Stufe.
 * Zwischen den Stufen wird linear überblendet (das Easing steckt in storyPos).
 */
export function storyAt(g: Affine, order: Order, tl: number): { A: Affine; stage: number; local: number } {
  const st = stageAffines(g, order);
  const t = Math.max(0, Math.min(4, tl));
  const k = Math.min(3, Math.floor(t));
  const local = t - k;
  return { A: lerpAffine(st[k]!, st[k + 1]!, local), stage: k, local };
}

/** Zeitplan der abgespielten Schrittfolge (in Sekunden). */
export const STORY = { lead: 0.7, move: 1.8, pause: 0.85 } as const;

/** Zeitplan: Vorlauf, Bewegungs- und Pausendauer je Stufe. */
export interface StoryPlan {
  lead: number;
  move: number[];
  pause: number[];
}

const DEFAULT_PLAN: StoryPlan = { lead: STORY.lead, move: [STORY.move, STORY.move, STORY.move, STORY.move], pause: [STORY.pause, STORY.pause, STORY.pause, 0] };

/**
 * Zeitplan für eine Schrittfolge: Stufen ohne Wirkung (z. B. b = 1) laufen
 * kürzer, damit die wichtigen Schritte im Mittelpunkt stehen.
 */
export function storyPlan(neutral: readonly boolean[] = [false, false, false, false]): StoryPlan {
  const move = [0, 1, 2, 3].map((k) => (neutral[k] ? 0.45 : STORY.move));
  const pause = [0, 1, 2, 3].map((k) => (k === 3 ? 0 : neutral[k] ? 0.25 : STORY.pause));
  return { lead: STORY.lead, move, pause };
}

/** Stufen ohne Wirkung in der Reihenfolge der Schrittfolge. */
export function neutralSteps(t: Trafo, order: Order = 'std'): boolean[] {
  return stepKeys(order).map((k) => (k === 'a' || k === 'b' ? t[k] === 1 : t[k] === 0));
}

const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Beginn der Bewegung von Stufe k (k = 0 … 4; 4 = Ende). */
function stageStart(plan: StoryPlan, k: number): number {
  let t = plan.lead;
  for (let i = 0; i < k; i++) t += plan.move[i]! + plan.pause[i]!;
  return t;
}

/** Dauer der ganzen Schrittfolge. */
export function storyDuration(plan: StoryPlan = DEFAULT_PLAN): number {
  return stageStart(plan, 4);
}

/** Zeit (s) → Lage auf der Zeitleiste (mit Pausen nach jeder Stufe und weichem Anfahren/Abbremsen). */
export function storyPos(time: number, plan: StoryPlan = DEFAULT_PLAN): number {
  if (time <= plan.lead) return 0;
  for (let k = 0; k < 4; k++) {
    const s = stageStart(plan, k);
    const e = s + plan.move[k]! + plan.pause[k]!;
    if (time < e) return Math.min(4, k + inOutCubic(Math.min(1, (time - s) / plan.move[k]!)));
  }
  return 4;
}

/** Zeitpunkt, an dem die Schrittfolge die Lage tl erreicht (für ganzzahlige tl exakt). */
export function storyTimeOf(tl: number, plan: StoryPlan = DEFAULT_PLAN): number {
  const t = Math.max(0, Math.min(4, tl));
  if (t <= 0) return 0;
  const k = Math.floor(t);
  if (k >= 4) return storyDuration(plan);
  // innerhalb einer Stufe: Easing umkehren (Bisektion)
  const frac = t - k;
  if (frac === 0) return stageStart(plan, k);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (inOutCubic(m) < frac) lo = m;
    else hi = m;
  }
  return stageStart(plan, k) + ((lo + hi) / 2) * plan.move[k]!;
}

/* ------------------------------------------------------------------ */
/* Wirkung der Parameter                                               */
/* ------------------------------------------------------------------ */

export type EffectKind = 'none' | 'stretch' | 'squash' | 'mirror' | 'zero' | 'right' | 'left' | 'up' | 'down';

export interface Effect {
  key: StepKey;
  kind: EffectKind;
  /** Streckfaktor (a bzw. 1/b, als Betrag) oder Verschiebung (Betrag). */
  amount: number;
  /** zusätzlich gespiegelt (a < 0: an der x-Achse, b < 0: an der y-Achse) */
  mirror: boolean;
}

/**
 * Wirkung eines Parameters in Worten-tauglicher Form, z. B. b = 2:
 * Stauchung in x-Richtung mit dem Faktor 0,5.
 */
export function effectOf(key: StepKey, t: Trafo): Effect {
  if (key === 'a' || key === 'b') {
    const v = t[key];
    if (key === 'a' && v === 0) return { key, kind: 'zero', amount: 0, mirror: false };
    const factor = key === 'a' ? Math.abs(v) : 1 / Math.abs(v);
    const mirror = v < 0;
    let kind: EffectKind;
    if (Math.abs(factor - 1) < 1e-12) kind = mirror ? 'mirror' : 'none';
    else kind = factor > 1 ? 'stretch' : 'squash';
    return { key, kind, amount: factor, mirror };
  }
  const v = t[key];
  if (v === 0) return { key, kind: 'none', amount: 0, mirror: false };
  if (key === 'c') return { key, kind: v > 0 ? 'right' : 'left', amount: Math.abs(v), mirror: false };
  return { key, kind: v > 0 ? 'up' : 'down', amount: Math.abs(v), mirror: false };
}

/* ------------------------------------------------------------------ */
/* Eigenschaften von g                                                 */
/* ------------------------------------------------------------------ */

/** Zahlenmenge: ganz ℝ, ein Intervall, ℝ ohne einen Wert oder ein einzelner Wert. */
export type NumSet =
  | { kind: 'all' }
  | { kind: 'interval'; lo: number; hi: number; loIn: boolean; hiIn: boolean }
  | { kind: 'except'; x: number }
  | { kind: 'point'; x: number };

const ALL: NumSet = { kind: 'all' };

/** Definitionsmenge von g. */
export function domainOf(kind: Base, t: Trafo): NumSet {
  if (kind === 'sqrt') return t.b > 0 ? { kind: 'interval', lo: t.c, hi: Infinity, loIn: true, hiIn: false } : { kind: 'interval', lo: -Infinity, hi: t.c, loIn: false, hiIn: true };
  if (kind === 'inv') return { kind: 'except', x: t.c };
  return ALL;
}

/** Wertemenge von g. */
export function rangeOf(kind: Base, t: Trafo): NumSet {
  const { a, d } = t;
  if (a === 0) return { kind: 'point', x: d };
  switch (kind) {
    case 'sq':
    case 'abs':
    case 'sqrt':
      return a > 0 ? { kind: 'interval', lo: d, hi: Infinity, loIn: true, hiIn: false } : { kind: 'interval', lo: -Infinity, hi: d, loIn: false, hiIn: true };
    case 'cub':
      return ALL;
    case 'inv':
      return { kind: 'except', x: d };
    case 'sin':
      return { kind: 'interval', lo: d - Math.abs(a), hi: d + Math.abs(a), loIn: true, hiIn: true };
    case 'exp':
      return a > 0 ? { kind: 'interval', lo: d, hi: Infinity, loIn: false, hiIn: false } : { kind: 'interval', lo: -Infinity, hi: d, loIn: false, hiIn: false };
  }
}

/** Liegt x in der Menge? */
export function inSet(s: NumSet, x: number): boolean {
  switch (s.kind) {
    case 'all':
      return true;
    case 'except':
      return x !== s.x;
    case 'point':
      return x === s.x;
    case 'interval':
      return (x > s.lo || (s.loIn && x === s.lo)) && (x < s.hi || (s.hiIn && x === s.hi));
  }
}

/** Periode und Amplitude (nur Sinus). */
export function sineData(t: Trafo): { period: number; amplitude: number; midline: number } {
  return { period: (2 * Math.PI) / Math.abs(t.b), amplitude: Math.abs(t.a), midline: t.d };
}

/** Art des besonderen Punkts (c | d). */
export type SpecialKind = 'vertex' | 'kink' | 'start' | 'center' | 'midpoint' | 'onAsymptote';

export function specialPoint(kind: Base, t: Trafo): { kind: SpecialKind; x: number; y: number } {
  const k: Record<Base, SpecialKind> = { sq: 'vertex', abs: 'kink', sqrt: 'start', cub: 'center', inv: 'center', sin: 'midpoint', exp: 'onAsymptote' };
  return { kind: k[kind], x: t.c, y: t.d };
}

/** Symmetrie von g: Achse x = c (Parabel, Betrag) oder Zentrum (c | d) (kubische Parabel, Hyperbel). */
export function symmetryOf(kind: Base, t: Trafo): { axis?: number; center?: [number, number] } {
  if (t.a === 0) return {};
  if (kind === 'sq' || kind === 'abs') return { axis: t.c };
  if (kind === 'cub' || kind === 'inv') return { center: [t.c, t.d] };
  return {};
}

/**
 * Nullstellen von g im Bereich [lo; hi] (aufsteigend). 'all': g ist die Nullfunktion.
 * Für den Sinus wird lo/hi gebraucht (unendlich viele Nullstellen).
 */
export function zerosIn(kind: Base, t: Trafo, lo = -Infinity, hi = Infinity): number[] | 'all' {
  const { a, b, c, d } = t;
  if (a === 0) return d === 0 ? 'all' : [];
  const q = -d / a;
  const out: number[] = [];
  const push = (x: number) => {
    if (Number.isFinite(x) && x >= lo - 1e-12 && x <= hi + 1e-12 && !out.some((y) => Math.abs(y - x) < 1e-9)) out.push(x);
  };
  switch (kind) {
    case 'sq':
      if (q === 0) push(c);
      else if (q > 0) {
        const r = Math.sqrt(q) / Math.abs(b);
        push(c - r);
        push(c + r);
      }
      break;
    case 'abs':
      if (q === 0) push(c);
      else if (q > 0) {
        const r = q / Math.abs(b);
        push(c - r);
        push(c + r);
      }
      break;
    case 'cub':
      push(c + Math.cbrt(q) / b);
      break;
    case 'sqrt':
      if (q >= 0) push(c + (q * q) / b);
      break;
    case 'inv':
      if (d !== 0) push(c - a / (b * d));
      break;
    case 'exp':
      if (q > 0) push(c + Math.log2(q) / b);
      break;
    case 'sin': {
      if (Math.abs(q) > 1 || !Number.isFinite(lo) || !Number.isFinite(hi)) break;
      const u1 = Math.asin(q);
      const u2 = Math.PI - u1;
      // x = c + (u + 2πk)/b liegt in [lo; hi]
      const uLo = Math.min(b * (lo - c), b * (hi - c));
      const uHi = Math.max(b * (lo - c), b * (hi - c));
      for (const u0 of [u1, u2]) {
        const k0 = Math.ceil((uLo - u0) / (2 * Math.PI) - 1e-12);
        for (let k = k0; u0 + 2 * Math.PI * k <= uHi + 1e-12 && k < k0 + 400; k++) push(c + (u0 + 2 * Math.PI * k) / b);
      }
      break;
    }
  }
  return out.sort((x, y) => x - y);
}

/** y-Achsenabschnitt g(0) (NaN, wenn 0 nicht in der Definitionsmenge liegt). */
export function yIntercept(kind: Base, t: Trafo): number {
  return transformed(kind, t, 0);
}

/**
 * Haben zwei Parametersätze denselben Graphen? (Stichprobe an vielen Stellen.)
 * Beispiel: (2x)² = 4x² – bei der Parabel wirkt b wie ein Faktor b² vor f.
 */
export function sameGraph(kind: Base, t1: Trafo, t2: Trafo, lo = -6, hi = 6, n = 241): boolean {
  for (let i = 0; i < n; i++) {
    const x = lo + ((hi - lo) * i) / (n - 1);
    const y1 = transformed(kind, t1, x);
    const y2 = transformed(kind, t2, x);
    const f1 = Number.isFinite(y1);
    if (f1 !== Number.isFinite(y2)) return false;
    if (f1 && Math.abs(y1 - y2) > 1e-9 * Math.max(1, Math.abs(y1))) return false;
  }
  return true;
}

/**
 * Gleichwertige Schreibweise mit b = 1 (falls es eine gibt):
 * x²: a·(b(x − c))² = a·b²·(x − c)², |x|: a·|b|·|x − c|, x³: a·b³·(x − c)³,
 * 1/x: a/b · 1/(x − c), √x (b > 0): a·√b·√(x − c).
 */
export function withoutB(kind: Base, t: Trafo): Trafo | null {
  const { a, b, c, d } = t;
  switch (kind) {
    case 'sq':
      return { a: a * b * b, b: 1, c, d };
    case 'abs':
      return { a: a * Math.abs(b), b: 1, c, d };
    case 'cub':
      return { a: a * b * b * b, b: 1, c, d };
    case 'inv':
      return { a: a / b, b: 1, c, d };
    case 'sqrt':
      return b > 0 ? { a: a * Math.sqrt(b), b: 1, c, d } : null;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Aufgaben „Term erraten“                                             */
/* ------------------------------------------------------------------ */

/**
 * Zufällige, gut ablesbare Parameter für die Aufgabe „Welcher Term gehört zum
 * Graphen?“. Die Werte sind so gewählt, dass die Lösung eindeutig ist: Bei
 * Parabel, Betrag, kubischer Parabel und Hyperbel bleibt b = 1 (b wirkt dort
 * wie ein Faktor vor f), bei der Wurzel ist |b| = 1, bei Sinus und
 * Exponentialfunktion c = 0 (2^(x − c) = 2^(−c) · 2^x).
 */
export function randomTask(kind: Base, rnd: () => number): Trafo {
  const pick = <T>(xs: readonly T[]): T => xs[Math.min(xs.length - 1, Math.floor(rnd() * xs.length))]!;
  const int = (lo: number, hi: number) => lo + Math.min(hi - lo, Math.floor(rnd() * (hi - lo + 1)));
  for (let tries = 0; tries < 50; tries++) {
    let t: Trafo;
    switch (kind) {
      case 'sq':
      case 'abs':
        t = { a: pick([-2, -1, -0.5, 0.5, 1, 2]), b: 1, c: int(-3, 3), d: int(-3, 3) };
        break;
      case 'cub':
        t = { a: pick([-1, -0.5, 0.5, 1]), b: 1, c: int(-3, 3), d: int(-2, 2) };
        break;
      case 'sqrt':
        t = { a: pick([-2, -1, 1, 2]), b: pick([-1, 1]), c: int(-3, 3), d: int(-2, 2) };
        break;
      case 'inv':
        t = { a: pick([-2, -1, 1, 2]), b: 1, c: int(-3, 3), d: int(-2, 2) };
        break;
      case 'sin':
        t = { a: pick([-2, -1, 1, 2, 3]), b: pick([0.5, 1, 2]), c: 0, d: int(-1, 2) };
        break;
      case 'exp':
        t = { a: pick([-2, -1, 1, 2]), b: pick([-1, 1]), c: 0, d: int(-2, 2) };
        break;
    }
    // nicht die Grundfunktion selbst
    if (!sameGraph(kind, t, IDENTITY)) return t;
  }
  return { a: 2, b: 1, c: 1, d: -1 };
}
