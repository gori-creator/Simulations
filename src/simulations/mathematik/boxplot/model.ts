/**
 * Rechenlogik für „Mittelwert, Median und Boxplot“: Daten einlesen und
 * ausgeben, Kennwerte (Minimum, Quartile, Median, Maximum, arithmetisches
 * Mittel, Spannweite, Quartilsabstand), Ausreißer nach der 1,5-IQR-Regel,
 * Rangplätze und eine runde Achseneinteilung. Keine Zeichenbefehle.
 *
 * Quartile: Die geordnete Liste wird am Median in eine untere und eine obere
 * Hälfte geteilt (bei ungerader Anzahl gehört der Median zu keiner Hälfte).
 * Das untere Quartil Q₁ ist der Median der unteren, das obere Quartil Q₃ der
 * Median der oberen Hälfte. So steht es in vielen deutschen Schulbüchern;
 * andere Bücher und Programme verwenden leicht abweichende Festlegungen.
 */

export type ContextId = 'test' | 'geld' | 'sprung' | 'weg' | 'own';

/** Ein Sachzusammenhang mit festem Wertebereich und zwei Beispiel-Datensätzen. */
export interface ContextDef {
  id: ContextId;
  /** Kleinster und größter Wert auf dem Zahlenstrahl (bei `own`: aus den Daten). */
  min: number;
  max: number;
  /** Raster beim Ziehen (zugleich die Genauigkeit der Daten). */
  step: number;
  /** Abstand der beschrifteten Striche. */
  tick: number;
  /** Nachkommastellen der Daten. */
  dec: number;
  /** Einheitenzeichen (leer: ohne Einheit). */
  unit: string;
  /** Gruppe A (Urliste, ungeordnet). */
  a: readonly number[];
  /** Gruppe B zum Vergleichen. */
  b: readonly number[];
}

export const CONTEXTS: Record<ContextId, ContextDef> = {
  // Gleicher Median (20) und gleicher Mittelwert (19,67) – aber B streut viel stärker.
  test: { id: 'test', min: 0, max: 30, step: 1, tick: 5, dec: 0, unit: '', a: [21, 12, 25, 18, 9, 27, 16, 22, 19, 24, 14, 20, 28, 17, 23], b: [20, 5, 26, 13, 30, 17, 8, 24, 21, 10, 29, 15, 27, 20, 30] },
  // Ein Ausreißer (90 €) zieht den Mittelwert nach oben, der Median bleibt bei 25 €.
  geld: { id: 'geld', min: 0, max: 100, step: 1, tick: 10, dec: 0, unit: '€', a: [20, 15, 25, 30, 20, 90, 25, 35, 25, 40, 30], b: [30, 10, 45, 20, 35, 25, 50, 15, 40, 20, 30] },
  // Gerade Anzahl: Median und Quartile liegen zwischen zwei Werten.
  sprung: { id: 'sprung', min: 2, max: 5, step: 0.1, tick: 0.5, dec: 1, unit: 'm', a: [3.4, 3.8, 2.9, 4.1, 3.6, 3.2, 4.4, 3.7, 3.5, 3.9, 3.1, 4.0], b: [3.6, 4.2, 3.0, 4.5, 3.9, 3.3, 4.8, 4.0, 3.5, 4.3, 3.8, 4.6] },
  // Rechtsschief mit Ausreißer: lange obere Antenne.
  weg: { id: 'weg', min: 0, max: 60, step: 1, tick: 10, dec: 0, unit: 'min', a: [12, 5, 25, 15, 8, 45, 10, 18, 12, 30, 15, 20], b: [10, 3, 15, 8, 22, 5, 12, 25, 6, 15, 10, 20] },
  own: { id: 'own', min: 0, max: 10, step: 1, tick: 1, dec: 0, unit: '', a: [4, 7, 2, 5, 4, 9, 3, 4, 2, 6], b: [5, 3, 6, 8, 5, 4, 7, 6] },
};

/** Höchstzahl der Werte je Gruppe (Platz auf dem Zahlenstrahl, Länge der Links). */
export const MAX_N = 30;

/* ------------------------------------------------------------------ */
/* Einlesen und Ausgeben                                               */
/* ------------------------------------------------------------------ */

/**
 * Liest eine Werteliste. Trennzeichen: Semikolon, Leerzeichen, Schrägstrich
 * oder senkrechter Strich; das Komma ist (wie im Deutschen) das Dezimalkomma,
 * ein Punkt wird ebenfalls verstanden. Ungültige Einträge werden übergangen,
 * höchstens `MAX_N` Werte.
 */
export function parseData(text: string): number[] {
  const out: number[] = [];
  for (const raw of text.split(/[;\s/|]+/)) {
    const t = raw.trim().replace(/[−–]/g, '-').replace(',', '.');
    if (!t || !/^-?(\d+\.?\d*|\.\d+)$/.test(t)) continue;
    const v = Number(t);
    if (Number.isFinite(v)) out.push(v);
    if (out.length >= MAX_N) break;
  }
  return out;
}

/** Werte auf das Raster runden (ohne Gleitkomma-Reste wie 3,4000000001). */
export function snap(v: number, step: number): number {
  const s = Math.round(v / step) * step;
  const dec = decimalsOf(step);
  return Number(s.toFixed(dec));
}

/** Nachkommastellen einer Schrittweite (0,1 → 1; 0,05 → 2; 5 → 0). */
export function decimalsOf(step: number): number {
  const t = String(step);
  const dot = t.indexOf('.');
  return dot < 0 ? 0 : t.length - dot - 1;
}

/** Wie viele Nachkommastellen brauchen diese Werte (höchstens 2)? */
export function dataDecimals(values: readonly number[]): number {
  let d = 0;
  for (const v of values) {
    for (let k = 0; k <= 2; k++) {
      if (Math.abs(v * 10 ** k - Math.round(v * 10 ** k)) < 1e-9) {
        d = Math.max(d, k);
        break;
      }
      if (k === 2) d = 2;
    }
  }
  return d;
}

/** Werteliste für das Textfeld: „3,4; 3,8; 2,9“ (DE) bzw. „3.4; 3.8; 2.9“ (EN). */
export function formatData(values: readonly number[], dec: number, lang: 'de' | 'en' = 'de'): string {
  return values
    .map((v) => {
      const t = Number(v.toFixed(dec)).toString();
      return lang === 'de' ? t.replace('.', ',').replace('-', '−') : t.replace('-', '−');
    })
    .join('; ');
}

/** Werte in den Bereich [min, max] holen und auf das Raster runden. */
export function clampData(values: readonly number[], min: number, max: number, step: number): number[] {
  return values.map((v) => snap(Math.min(max, Math.max(min, v)), step));
}

/* ------------------------------------------------------------------ */
/* Kennwerte                                                           */
/* ------------------------------------------------------------------ */

export function sortAsc(values: readonly number[]): number[] {
  return values.slice().sort((a, b) => a - b);
}

/** Median einer bereits geordneten Liste (Mittelwert der beiden mittleren bei gerader Anzahl). */
export function medianSorted(s: readonly number[]): number {
  const n = s.length;
  if (n === 0) return NaN;
  const m = Math.floor(n / 2);
  return n % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export function median(values: readonly number[]): number {
  return medianSorted(sortAsc(values));
}

/** Arithmetisches Mittel x̄ = Summe / Anzahl. */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Untere und obere Hälfte der geordneten Liste (ohne den Median bei ungerader Anzahl). */
export function halves(s: readonly number[]): { lower: number[]; upper: number[] } {
  const n = s.length;
  const h = Math.floor(n / 2);
  if (n === 1) return { lower: [s[0]!], upper: [s[0]!] };
  return { lower: s.slice(0, h), upper: s.slice(n - h) };
}

export interface Summary {
  n: number;
  sorted: number[];
  min: number;
  q1: number;
  med: number;
  q3: number;
  max: number;
  mean: number;
  sum: number;
  /** Spannweite = Maximum − Minimum. */
  range: number;
  /** Quartilsabstand = Q₃ − Q₁ (Breite der Box). */
  iqr: number;
}

/** Fünf-Zahlen-Zusammenfassung und weitere Kennwerte. */
export function summarize(values: readonly number[]): Summary {
  const s = sortAsc(values);
  const n = s.length;
  if (n === 0) return { n: 0, sorted: [], min: NaN, q1: NaN, med: NaN, q3: NaN, max: NaN, mean: NaN, sum: 0, range: NaN, iqr: NaN };
  const { lower, upper } = halves(s);
  const q1 = medianSorted(lower);
  const q3 = medianSorted(upper);
  const total = sum(s);
  return { n, sorted: s, min: s[0]!, q1, med: medianSorted(s), q3, max: s[n - 1]!, mean: total / n, sum: total, range: s[n - 1]! - s[0]!, iqr: q3 - q1 };
}

/**
 * Rangplätze (1-basiert), aus denen ein Median gebildet wird:
 * n = 15 → [8]; n = 12 → [6, 7]. `offset` verschiebt (für die obere Hälfte).
 */
export function medianRanks(n: number, offset = 0): number[] {
  if (n <= 0) return [];
  const m = Math.floor(n / 2);
  return (n % 2 ? [m + 1] : [m, m + 1]).map((r) => r + offset);
}

/** Rangplätze für Q₁, Median und Q₃ in der geordneten Liste der Länge n. */
export function quartileRanks(n: number): { q1: number[]; med: number[]; q3: number[] } {
  if (n === 1) return { q1: [1], med: [1], q3: [1] };
  const h = Math.floor(n / 2);
  return { q1: medianRanks(h), med: medianRanks(n), q3: medianRanks(h, n - h) };
}

/** Grenzen für Ausreißer: Werte außerhalb [Q₁ − k·IQR, Q₃ + k·IQR] (üblich k = 1,5). */
export function fences(sm: Summary, k = 1.5): { lo: number; hi: number } {
  return { lo: sm.q1 - k * sm.iqr, hi: sm.q3 + k * sm.iqr };
}

/**
 * Antennen (Whisker): ohne Ausreißer-Regel bis Minimum und Maximum, mit Regel
 * bis zum kleinsten bzw. größten Wert innerhalb der Grenzen.
 */
export function whiskers(sm: Summary, withOutliers: boolean, k = 1.5): { lo: number; hi: number; outliers: number[] } {
  if (sm.n === 0) return { lo: NaN, hi: NaN, outliers: [] };
  if (!withOutliers) return { lo: sm.min, hi: sm.max, outliers: [] };
  const f = fences(sm, k);
  const eps = 1e-9;
  const inside = sm.sorted.filter((v) => v >= f.lo - eps && v <= f.hi + eps);
  const outliers = sm.sorted.filter((v) => v < f.lo - eps || v > f.hi + eps);
  return { lo: inside[0] ?? sm.min, hi: inside[inside.length - 1] ?? sm.max, outliers };
}

/** Anteil der Werte, die kleiner oder gleich x sind (für „mindestens 25 % …“-Aussagen). */
export function shareAtMost(values: readonly number[], x: number): number {
  if (values.length === 0) return 0;
  return values.filter((v) => v <= x + 1e-9).length / values.length;
}

/* ------------------------------------------------------------------ */
/* Zahlenstrahl und Punkte                                             */
/* ------------------------------------------------------------------ */

/** Runde Schrittweite (1, 2, 2,5, 5 · 10ᵏ) in der Nähe von `raw`. */
export function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const e = Math.floor(Math.log10(raw));
  const b = raw / 10 ** e;
  const m = b <= 1 ? 1 : b <= 2 ? 2 : b <= 2.5 ? 2.5 : b <= 5 ? 5 : 10;
  return Number((m * 10 ** e).toPrecision(12));
}

/** Bereich und Raster für eigene Daten: runde Grenzen mit etwas Luft. */
export function autoRange(values: readonly number[]): { min: number; max: number; tick: number; step: number } {
  if (values.length === 0) return { min: 0, max: 10, tick: 1, step: 1 };
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const tick = niceStep((hi - lo) / 6);
  const min = Math.floor(lo / tick - 1e-9) * tick - (lo % tick === 0 ? tick : 0);
  const max = Math.ceil(hi / tick + 1e-9) * tick + (hi % tick === 0 ? tick : 0);
  const dec = dataDecimals(values);
  return { min: Number(min.toFixed(6)), max: Number(max.toFixed(6)), tick, step: 10 ** -dec };
}

/** Striche von min bis max im Abstand `step` (ohne Rundungsreste). */
export function ticksBetween(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  const dec = Math.max(decimalsOf(step), 0);
  for (let k = Math.ceil(min / step - 1e-9); k * step <= max + 1e-9; k++) out.push(Number((k * step).toFixed(dec + 2)));
  return out;
}

/**
 * Stapelhöhe jedes Punktes im Punktdiagramm: Punkte, die sich (in Pixeln)
 * näher als `gap` kommen, stapeln sich übereinander – gleiche Werte also
 * immer. Reihenfolge: von links nach rechts, bei Gleichstand nach der Urliste
 * (0 = unterster Punkt).
 */
export function swarmLevels(xs: readonly number[], gap: number): number[] {
  const order = xs.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x || a.i - b.i);
  const level = new Array<number>(xs.length).fill(0);
  /** Rechtester Punkt je Ebene. */
  const right: number[] = [];
  for (const o of order) {
    let l = 0;
    while (right[l] !== undefined && o.x - right[l]! < gap - 1e-9) l++;
    right[l] = o.x;
    level[o.i] = l;
  }
  return level;
}

/** Rangplatz (0-basiert) jedes Wertes der Urliste in der geordneten Liste (stabil). */
export function sortRanks(values: readonly number[]): number[] {
  const order = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v || a.i - b.i);
  const rank = new Array<number>(values.length);
  order.forEach((o, r) => (rank[o.i] = r));
  return rank;
}
