/**
 * Rechenlogik für „Diagramme lesen und kritisch prüfen“: Anteile und Prozent,
 * Kreiswinkel (gerundet, Summe bleibt 360°), Achsenskalierung und die
 * typischen Täuschungen (abgeschnittene Achse, ungleiche Achsenabstände,
 * Flächen-Piktogramm, Prozentsumme ≠ 100 %). Keine Zeichenbefehle.
 */

export type DataId = 'sport' | 'wahl' | 'handy' | 'temp';

/** Ein kleiner Datensatz: Schlüssel der Regler, Startwerte, Bereich. */
export interface DatasetDef {
  id: DataId;
  /** Parameter-Schlüssel der einzelnen Werte (stehen in geteilten Links). */
  keys: readonly string[];
  defaults: readonly number[];
  min: number;
  max: number;
  step: number;
  /**
   * Sind die Werte Teile eines Ganzen? (Anzahlen von Kindern oder Stimmen,
   * Minuten einer Woche: ja. Temperaturen: nein – ein Kreisdiagramm ist dort sinnlos.)
   */
  whole: boolean;
  /** Zeitlicher Verlauf (Wochentage) – dann passt ein Liniendiagramm. */
  timeline: boolean;
  /** Wofür ein Bildchen im Piktogramm steht. */
  pictUnit: number;
}

export const DATASETS: Record<DataId, DatasetDef> = {
  sport: { id: 'sport', keys: ['s1', 's2', 's3', 's4', 's5'], defaults: [8, 6, 4, 3, 3], min: 0, max: 12, step: 1, whole: true, timeline: false, pictUnit: 1 },
  wahl: { id: 'wahl', keys: ['w1', 'w2', 'w3'], defaults: [95, 100, 92], min: 0, max: 150, step: 1, whole: true, timeline: false, pictUnit: 10 },
  handy: { id: 'handy', keys: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'], defaults: [40, 55, 35, 60, 90, 120, 105], min: 0, max: 240, step: 5, whole: true, timeline: true, pictUnit: 20 },
  temp: { id: 'temp', keys: ['t1', 't2', 't3', 't4', 't5', 't6', 't7'], defaults: [14, 17, 19, 16, 21, 23, 20], min: 0, max: 35, step: 1, whole: false, timeline: true, pictUnit: 5 },
};

/* ------------------------------------------------------------------ */
/* Anteile, Prozent, Winkel                                            */
/* ------------------------------------------------------------------ */

export function total(values: readonly number[]): number {
  return values.reduce((s, v) => s + v, 0);
}

/** Anteile am Ganzen (0, wenn die Summe 0 ist). */
export function shares(values: readonly number[]): number[] {
  const t = total(values);
  return values.map((v) => (t > 0 ? v / t : 0));
}

/** Prozentsatz p = Prozentwert / Grundwert · 100. */
export function percent(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

/**
 * Ganze Zahlen mit fester Summe verteilen (Verfahren der größten Reste):
 * erst abrunden, dann die übrigen Einheiten an die größten Nachkommareste.
 * So ergeben gerundete Kreiswinkel zusammen genau 360°.
 */
export function largestRemainder(weights: readonly number[], sum: number): number[] {
  const t = total(weights);
  if (t <= 0 || weights.length === 0) return weights.map(() => 0);
  const exact = weights.map((w) => (w / t) * sum);
  const out = exact.map((x) => Math.floor(x + 1e-9));
  let rest = sum - total(out);
  const order = exact.map((x, i) => ({ i, r: x - Math.floor(x + 1e-9) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let j = 0; rest > 0 && j < order.length; j++, rest--) out[order[j]!.i]! += 1;
  return out;
}

/** Mittelpunktswinkel im Kreisdiagramm: Anteil · 360°, ganzzahlig gerundet, Summe 360°. */
export function pieAngles(values: readonly number[]): number[] {
  return largestRemainder(values, 360);
}

/** Exakte Mittelpunktswinkel (ungerundet). */
export function exactAngles(values: readonly number[]): number[] {
  return shares(values).map((s) => s * 360);
}

/** Prozentangaben, auf `decimals` Stellen gerundet, deren Summe genau 100 ist. */
export function roundedPercents(values: readonly number[], decimals = 0): number[] {
  const f = 10 ** decimals;
  return largestRemainder(values, 100 * f).map((x) => x / f);
}

/** Bruch kürzen (für „8/24 = 1/3“). */
export function reduceFraction(num: number, den: number): [number, number] {
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const g = gcd(Math.round(num), Math.round(den)) || 1;
  return [Math.round(num) / g, Math.round(den) / g];
}

/* ------------------------------------------------------------------ */
/* Achsen                                                              */
/* ------------------------------------------------------------------ */

/** Kleinste „schöne“ Schrittweite (1, 2, 5 · 10ⁿ) ≥ raw. */
export function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const e = Math.floor(Math.log10(raw));
  const base = 10 ** e;
  const m = raw / base;
  const nice = m <= 1 + 1e-9 ? 1 : m <= 2 + 1e-9 ? 2 : m <= 5 + 1e-9 ? 5 : 10;
  return nice * base;
}

/**
 * Werteachse von `start` bis zu einem schönen Endwert ≥ dem größten Wert,
 * mit etwa `ticks` Abschnitten.
 */
export function valueAxis(maxValue: number, start = 0, ticks = 5): { start: number; top: number; step: number } {
  const range = Math.max(maxValue - start, 1e-9);
  const step = niceStep(range / ticks);
  let top = Math.ceil((maxValue - 1e-9) / step) * step;
  if (top <= start) top = start + step;
  return { start, top: Number(top.toPrecision(12)), step };
}

/** Position eines Werts auf einer linearen Achse (0 = Achsenanfang, 1 = Achsenende). */
export function axisFraction(v: number, start: number, top: number): number {
  return top > start ? (v - start) / (top - start) : 0;
}

/**
 * Wo eine täuschende Achse beginnen „sollte“: eine schöne Zahl knapp unter dem
 * kleinsten Wert (z. B. 90 bei 92, 95 und 100).
 */
export function suggestCut(values: readonly number[]): number {
  const min = Math.min(...values);
  if (!(min > 1)) return 0;
  const s = niceStep(min / 10);
  return Math.max(0, Number((Math.floor((min - 1) / s) * s).toPrecision(12)));
}

/** Achsenbeginn, der höchstens knapp unter dem kleinsten Wert liegt (jede Säule bleibt sichtbar). */
export function effectiveCut(values: readonly number[], cut: number): number {
  const min = Math.min(...values);
  return Math.max(0, Math.min(cut, min - 1));
}

/**
 * Wahrgenommenes Verhältnis bei abgeschnittener Achse: Säulenhöhen
 * (a − Start) : (b − Start). Beispiel: Start 90, Werte 95 und 100 → 5 : 10 = 0,5,
 * obwohl 95 : 100 = 0,95 ist.
 */
export function perceivedCutRatio(a: number, b: number, start: number): number {
  return b - start > 0 ? (a - start) / (b - start) : 0;
}

/** Echtes Verhältnis a : b. */
export function realRatio(a: number, b: number): number {
  return b > 0 ? a / b : 0;
}

/**
 * Täuschungsfaktor: Wie viel mal so groß wirkt der Unterschied?
 * (wahrgenommenes Verhältnis groß : klein geteilt durch das echte).
 */
export function lieFactor(perceivedSmallToLarge: number, realSmallToLarge: number): number {
  if (perceivedSmallToLarge <= 0 || realSmallToLarge <= 0) return Infinity;
  return realSmallToLarge / perceivedSmallToLarge;
}

/**
 * Ungleiche Achsenabstände: Diese Marken stehen in gleichen Abständen, obwohl
 * die Zahlensprünge wachsen (0, 10, 20, 50, 100, 200 …). Große Werte werden so
 * zusammengestaucht.
 */
export function unevenTicks(maxValue: number): number[] {
  const s = niceStep(Math.max(maxValue, 1) / 12);
  const ticks = [0];
  const mult = [1, 2, 5];
  for (let k = 0; ticks[ticks.length - 1]! < maxValue && k < 30; k++) {
    ticks.push(Number((mult[k % 3]! * 10 ** Math.floor(k / 3) * s).toPrecision(12)));
  }
  return ticks;
}

/** Position eines Werts (0…1) auf der ungleichmäßigen Achse: stückweise linear zwischen den Marken. */
export function unevenFraction(v: number, ticks: readonly number[]): number {
  const n = ticks.length - 1;
  if (n <= 0) return 0;
  if (v <= ticks[0]!) return 0;
  for (let i = 0; i < n; i++) {
    const a = ticks[i]!;
    const b = ticks[i + 1]!;
    if (v <= b) return (i + (v - a) / (b - a)) / n;
  }
  return 1;
}

/**
 * Flächen-Piktogramm: Wird ein Bildchen in Höhe UND Breite mit dem Wert
 * vergrößert, wächst seine Fläche mit dem Quadrat – doppelte Höhe, vierfache Fläche.
 */
export function areaRatio(a: number, b: number): number {
  const r = realRatio(a, b);
  return r * r;
}

/**
 * Falscher Grundwert für das Kreisdiagramm mit Summe ≠ 100 %: Statt durch die
 * Summe (24) wird durch eine zu kleine Zahl (20) geteilt.
 */
export function wrongBase(sum: number): number {
  return Math.max(1, Math.round((sum * 5) / 6));
}

/** Prozentangaben bezogen auf einen (falschen) Grundwert. */
export function percentsOf(values: readonly number[], base: number): number[] {
  return values.map((v) => percent(v, base));
}

/* ------------------------------------------------------------------ */
/* Strichliste, Piktogramm                                             */
/* ------------------------------------------------------------------ */

/** Strichliste: volle Fünferbündel und übrige Striche. */
export function tally(n: number): { bundles: number; rest: number } {
  const k = Math.max(0, Math.floor(n));
  return { bundles: Math.floor(k / 5), rest: k % 5 };
}

/** Anzahl der Bildchen im Piktogramm (auch angeschnittene: 2,5 Bildchen). */
export function iconCount(value: number, unit: number): number {
  return unit > 0 ? Math.max(0, value) / unit : 0;
}

/** Rang jedes Werts beim Sortieren (größter zuerst, bei Gleichstand die frühere Kategorie zuerst). */
export function ranks(values: readonly number[]): number[] {
  const order = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v || a.i - b.i);
  const out = new Array<number>(values.length).fill(0);
  order.forEach((o, r) => (out[o.i] = r));
  return out;
}
