/**
 * Funktion oder nicht? Zuordnungen und ihre Graphen.
 *
 * Eine Zuordnung von A nach B ist eine Funktion, wenn jedem Element von A
 * genau ein Element von B zugeordnet ist (Eindeutigkeit). Im Pfeildiagramm:
 * Von jedem Element links geht genau ein Pfeil aus. Am Graphen: Jede
 * senkrechte Gerade schneidet ihn höchstens einmal (senkrechter Linientest).
 */

export type Lang = 'de' | 'en';
type Text = Record<Lang, string>;

/* ------------------------------------------------------------------ */
/* Pfeildiagramme                                                      */
/* ------------------------------------------------------------------ */

export interface Item {
  label: Text;
  /** Zahlenwert (bei Zahlenmengen), sonst undefined. */
  value?: number;
}

export interface Mapping {
  a: Item[];
  b: Item[];
  /** Pfeile als Paare (Index in a, Index in b). */
  arrows: [number, number][];
  /** Sind beide Mengen Zahlenmengen? Dann ist der Graph ein echtes Koordinatensystem. */
  numeric: boolean;
  titleA: Text;
  titleB: Text;
  rule: Text;
}

export type ExampleId = 'square' | 'lin' | 'month' | 'own';
export const EXAMPLES: readonly ExampleId[] = ['square', 'lin', 'month', 'own'];

const MINUS = '−';
const num = (v: number): Item => {
  const s = (v < 0 ? MINUS : '') + Math.abs(v);
  return { label: { de: s, en: s }, value: v };
};
const word = (de: string, en = de): Item => ({ label: { de, en } });

/** Beispiel-Zuordnungen (vorwärts). */
export function exampleMapping(id: ExampleId): Mapping {
  switch (id) {
    case 'square': {
      const a = [-2, -1, 0, 1, 2];
      const b = [0, 1, 2, 3, 4];
      return {
        a: a.map(num),
        b: b.map(num),
        arrows: a.map((x, i) => [i, b.indexOf(x * x)] as [number, number]),
        numeric: true,
        titleA: { de: 'Zahl', en: 'Number' },
        titleB: { de: 'Quadrat', en: 'Square' },
        rule: { de: 'x ↦ x²', en: 'x ↦ x²' },
      };
    }
    case 'lin': {
      const a = [0, 1, 2, 3];
      const b = [1, 3, 5, 7];
      return {
        a: a.map(num),
        b: b.map(num),
        arrows: a.map((x, i) => [i, b.indexOf(2 * x + 1)] as [number, number]),
        numeric: true,
        titleA: { de: 'Zahl', en: 'Number' },
        titleB: { de: 'Doppeltes plus 1', en: 'Double plus 1' },
        rule: { de: 'x ↦ 2x + 1', en: 'x ↦ 2x + 1' },
      };
    }
    case 'month': {
      const kids = ['Ali', 'Ben', 'Cora', 'Dana', 'Emil'].map((n) => word(n));
      const months = [word('Jan.', 'Jan'), word('März', 'Mar'), word('Mai', 'May'), word('Aug.', 'Aug'), word('Nov.', 'Nov')];
      return {
        a: kids,
        b: months,
        arrows: [
          [0, 2],
          [1, 0],
          [2, 2],
          [3, 4],
          [4, 3],
        ],
        numeric: false,
        titleA: { de: 'Kind', en: 'Child' },
        titleB: { de: 'Geburtsmonat', en: 'Birth month' },
        rule: { de: 'Kind ↦ Geburtsmonat', en: 'child ↦ birth month' },
      };
    }
    case 'own':
      return {
        a: [1, 2, 3, 4].map(num),
        b: [1, 2, 3, 4, 5].map(num),
        arrows: [
          [0, 1],
          [1, 3],
          [2, 0],
          [2, 4],
        ],
        numeric: true,
        titleA: { de: 'Menge A', en: 'Set A' },
        titleB: { de: 'Menge B', en: 'Set B' },
        rule: { de: 'eigene Zuordnung', en: 'your own relation' },
      };
  }
}

/** Regel der umgekehrten Zuordnung in Worten. */
export const REVERSE_RULE: Record<ExampleId, Text> = {
  square: { de: 'Quadratzahl ↦ Zahl mit diesem Quadrat', en: 'square ↦ number with this square' },
  lin: { de: 'x ↦ (x − 1) : 2', en: 'x ↦ (x − 1) ÷ 2' },
  month: { de: 'Monat ↦ Kind mit Geburtstag in diesem Monat', en: 'month ↦ child born in this month' },
  own: { de: 'umgekehrte Zuordnung', en: 'reversed relation' },
};

/** Umkehren: Pfeile andersherum, Mengen tauschen. */
export function reverseMapping(m: Mapping, rule?: Text): Mapping {
  return {
    a: m.b,
    b: m.a,
    arrows: m.arrows.map(([i, j]) => [j, i] as [number, number]).sort((u, v) => u[0] - v[0] || u[1] - v[1]),
    numeric: m.numeric,
    titleA: m.titleB,
    titleB: m.titleA,
    rule: rule ?? m.rule,
  };
}

/** Pfeil setzen oder entfernen (liefert eine neue Liste). */
export function toggleArrow(arrows: readonly [number, number][], i: number, j: number): [number, number][] {
  const has = arrows.some(([p, q]) => p === i && q === j);
  const out = has ? arrows.filter(([p, q]) => !(p === i && q === j)) : [...arrows, [i, j] as [number, number]];
  return out.sort((u, v) => u[0] - v[0] || u[1] - v[1]);
}

export interface Analysis {
  /** Anzahl der Pfeile, die von jedem Element von A ausgehen. */
  out: number[];
  /** Anzahl der Pfeile, die bei jedem Element von B ankommen. */
  in: number[];
  /** Elemente von A ohne Pfeil. */
  missing: number[];
  /** Elemente von A mit mehreren Pfeilen. */
  multi: number[];
  /** Elemente von B, bei denen mehrere Pfeile ankommen (erlaubt!). */
  shared: number[];
  /** Elemente von B, die getroffen werden (Wertemenge, falls Funktion). */
  range: number[];
  isFunction: boolean;
}

export function analyze(m: Mapping): Analysis {
  const out = m.a.map((_, i) => m.arrows.filter(([p]) => p === i).length);
  const inn = m.b.map((_, j) => m.arrows.filter(([, q]) => q === j).length);
  const missing = out.flatMap((c, i) => (c === 0 ? [i] : []));
  const multi = out.flatMap((c, i) => (c > 1 ? [i] : []));
  return {
    out,
    in: inn,
    missing,
    multi,
    shared: inn.flatMap((c, j) => (c > 1 ? [j] : [])),
    range: inn.flatMap((c, j) => (c > 0 ? [j] : [])),
    isFunction: missing.length === 0 && multi.length === 0,
  };
}

/** Partner eines Elements von A (Indizes in B). */
export function targetsOf(m: Mapping, i: number): number[] {
  return m.arrows.filter(([p]) => p === i).map(([, q]) => q);
}

/* ------------------------------------------------------------------ */
/* Graphen und senkrechter Linientest                                  */
/* ------------------------------------------------------------------ */

export type CurveId = 'parab' | 'hyp' | 'step' | 'semi' | 'circle' | 'sideways' | 'scurve';
export const CURVES: readonly CurveId[] = ['parab', 'hyp', 'step', 'semi', 'circle', 'sideways', 'scurve'];

/** Radius von Kreis und Halbkreis. */
export const R = 3;
/** S-Kurve x = K·y³ − M·y = 0,25y³ − 2y (Umkehrstellen bei y = ±√(M/(3K)), x ≈ ∓2,18). */
const SK = 0.25;
const SM = 2;

/**
 * Reelle Lösungen von y³ + p·y + q = 0 (reduzierte kubische Gleichung),
 * aufsteigend; doppelte Lösungen einmal.
 */
export function depressedCubic(p: number, q: number): number[] {
  const disc = (q * q) / 4 + (p * p * p) / 27;
  const eps = 1e-12 * Math.max(1, Math.abs(q * q), Math.abs(p * p * p));
  if (Math.abs(disc) <= eps) {
    if (Math.abs(p) <= 1e-12) return [0];
    // doppelte Lösung −3q/(2p) und einfache 3q/p
    return [(3 * q) / p, (-3 * q) / (2 * p)].sort((u, v) => u - v);
  }
  if (disc > 0) {
    const s = Math.sqrt(disc);
    return [Math.cbrt(-q / 2 + s) + Math.cbrt(-q / 2 - s)];
  }
  // drei verschiedene reelle Lösungen (trigonometrische Form)
  const r = 2 * Math.sqrt(-p / 3);
  const phi = Math.acos(Math.max(-1, Math.min(1, ((3 * q) / (2 * p)) * Math.sqrt(-3 / p))));
  return [0, 1, 2].map((k) => r * Math.cos(phi / 3 - (2 * Math.PI * k) / 3)).sort((u, v) => u - v);
}

/** Wo schneidet die senkrechte Gerade x = c den Graphen? (y-Werte, aufsteigend) */
export function curveYs(id: CurveId, c: number): number[] {
  switch (id) {
    case 'parab':
      return [0.5 * c * c - 2];
    case 'hyp':
      return c === 0 ? [] : [2 / c];
    case 'step':
      return [Math.floor(c)];
    case 'semi':
      return Math.abs(c) <= R ? [Math.sqrt(Math.max(0, R * R - c * c))] : [];
    case 'circle': {
      if (Math.abs(c) > R) return [];
      const y = Math.sqrt(Math.max(0, R * R - c * c));
      return y === 0 ? [0] : [-y, y];
    }
    case 'sideways': {
      // x = 0,5y² − 2
      if (c < -2) return [];
      const y = Math.sqrt(2 * (c + 2));
      return y === 0 ? [0] : [-y, y];
    }
    case 'scurve':
      // K·y³ − M·y = c  ⇔  y³ − (M/K)·y − c/K = 0
      return depressedCubic(-SM / SK, -c / SK);
  }
}

/** Ist der Graph der Graph einer Funktion? */
export const IS_FUNCTION: Record<CurveId, boolean> = {
  parab: true,
  hyp: true,
  step: true,
  semi: true,
  circle: false,
  sideways: false,
  scurve: false,
};

/** Eine Stelle, an der der Linientest scheitert (für die Begründung). */
export const WITNESS: Partial<Record<CurveId, number>> = { circle: 0, sideways: 0, scurve: 0 };

/** Punkte des Graphen als Linienzüge (für die Darstellung). */
export function curvePaths(id: CurveId, xMin = -7, xMax = 7, n = 240): [number, number][][] {
  const range = (a: number, b: number, k: number, f: (t: number) => [number, number]) => Array.from({ length: k + 1 }, (_, i) => f(a + ((b - a) * i) / k));
  switch (id) {
    case 'parab':
      return [range(xMin, xMax, n, (x) => [x, 0.5 * x * x - 2])];
    case 'hyp':
      return [range(xMin, -0.2, n, (x) => [x, 2 / x]), range(0.2, xMax, n, (x) => [x, 2 / x])];
    case 'step': {
      const out: [number, number][][] = [];
      for (let k = Math.floor(xMin); k < xMax; k++) out.push([
        [k, k],
        [k + 1, k],
      ]);
      return out;
    }
    case 'semi':
      return [range(0, Math.PI, n, (t) => [R * Math.cos(t), R * Math.sin(t)])];
    case 'circle':
      return [range(0, 2 * Math.PI, n, (t) => [R * Math.cos(t), R * Math.sin(t)])];
    case 'sideways':
      return [range(-5, 5, n, (y) => [0.5 * y * y - 2, y])];
    case 'scurve':
      return [range(-4.2, 4.2, n, (y) => [SK * y * y * y - SM * y, y])];
  }
}

/** Anzahl der Schnittpunkte für n + 1 Stellen von x0 bis x1 (Leiste unter dem Graphen). */
export function countProfile(id: CurveId, x0: number, x1: number, n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => curveYs(id, x0 + ((x1 - x0) * i) / n).length);
}
