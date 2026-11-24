/** Rechenlogik „Exponentielles Wachstum und Zerfall“: f(t) = a · bᵗ mit b = 1 + p/100. */

export function growthFactor(percent: number): number {
  return 1 + percent / 100;
}

export function exponential(a: number, percent: number, t: number): number {
  return a * growthFactor(percent) ** t;
}

/** Lineares Wachstum mit derselben Änderung im ersten Schritt: g(t) = a + a·p/100·t. */
export function linearComparison(a: number, percent: number, t: number): number {
  return a + ((a * percent) / 100) * t;
}

/** Verdopplungszeit (p > 0) bzw. Halbwertszeit (p < 0) in Zeitschritten. */
export function characteristicTime(percent: number): number {
  const b = growthFactor(percent);
  if (b <= 0 || b === 1) return NaN;
  return Math.log(b > 1 ? 2 : 0.5) / Math.log(b);
}

/** Zeitpunkt, zu dem f(t) = target erreicht wird. */
export function timeToReach(a: number, percent: number, target: number): number {
  const b = growthFactor(percent);
  if (a <= 0 || target <= 0 || b <= 0 || b === 1) return NaN;
  return Math.log(target / a) / Math.log(b);
}

/** Ist `value` auf `decimals` Nachkommastellen exakt darstellbar? Dann „=“, sonst „≈“. */
export function isExactTo(value: number, decimals: number): boolean {
  const f = value * 10 ** decimals;
  return Math.abs(f - Math.round(f)) < 1e-9 * Math.max(1, Math.abs(f));
}

/** Nachkommastellen für Anzeigen: kleine Werte genauer, große ganzzahlig. */
export function displayDecimals(value: number): number {
  const v = Math.abs(value);
  if (v >= 1000) return 0;
  return v < 10 ? 2 : 1;
}

// ───────────────────────── Messwerte: Funktion anpassen ─────────────────────────

export type DataSetId = 'bakterien' | 'tee' | 'medikament';

export interface DataSet {
  /** Messpunkte (t, Wert); erfundene Beispieldaten mit kleinen Messschwankungen */
  points: readonly (readonly [number, number])[];
  /** dargestellter Zeitraum */
  span: number;
}

export const DATASETS: Record<DataSetId, DataSet> = {
  // Bakterienkultur, Anzahl in Tausend, t in Stunden (etwa +40 % pro Stunde)
  bakterien: {
    points: [
      [0, 500],
      [1, 712],
      [2, 975],
      [3, 1390],
      [4, 1905],
      [5, 2710],
      [6, 3760],
    ],
    span: 7,
  },
  // Abkühlender Tee: Temperaturunterschied zum Zimmer in °C, t in Minuten (etwa −4 % pro Minute)
  tee: {
    points: [
      [0, 70],
      [5, 57.5],
      [10, 46.2],
      [15, 38.3],
      [20, 30.6],
      [25, 25.4],
      [30, 20.4],
    ],
    span: 32,
  },
  // Wirkstoff im Blut in mg, t in Stunden (etwa −15 % pro Stunde)
  medikament: {
    points: [
      [0, 400],
      [2, 291],
      [4, 207],
      [6, 152],
      [8, 108],
      [10, 79],
    ],
    span: 11,
  },
};

/** Exponentialfunktion durch zwei Punkte: b = (v₂/v₁)^(1/(t₂ − t₁)), a = v₁ / b^t₁. */
export function fromTwoPoints(t1: number, v1: number, t2: number, v2: number): { a: number; b: number; p: number } {
  const b = (v2 / v1) ** (1 / (t2 - t1));
  const a = v1 / b ** t1;
  return { a, b, p: (b - 1) * 100 };
}

/** Mittlere relative Abweichung der Messpunkte von f(t) = a · (1 + p/100)ᵗ (0 = perfekt). */
export function fitError(points: readonly (readonly [number, number])[], a: number, p: number): number {
  if (points.length === 0) return NaN;
  let sum = 0;
  for (const [t, v] of points) sum += Math.abs(exponential(a, p, t) - v) / v;
  return sum / points.length;
}

// ───────────────────────── Üben ─────────────────────────

export type GrowthTaskKind = 'value' | 'percent' | 'doubling';

export interface GrowthTask {
  kind: GrowthTaskKind;
  a: number;
  p: number;
  /** Zeitpunkt (nur bei „value“) */
  t: number;
  answer: number;
}

const A_VALUES = [50, 200, 500, 1000, 2000] as const;
const P_VALUES = [3, 5, 8, 10, 20, 25, -10, -20, -25] as const;

/**
 * Reproduzierbare Aufgabe Nr. q: ungerade Nummern fragen einen Funktionswert,
 * gerade abwechselnd die prozentuale Änderung aus zwei Werten und die
 * Verdopplungs- bzw. Halbwertszeit.
 */
export function growthTask(q: number, rand: () => number): GrowthTask {
  const a = A_VALUES[Math.floor(rand() * A_VALUES.length)]!;
  const p = P_VALUES[Math.floor(rand() * P_VALUES.length)]!;
  const kind: GrowthTaskKind = q % 2 === 1 ? 'value' : q % 4 === 2 ? 'percent' : 'doubling';
  const t = 2 + Math.floor(rand() * 5);
  if (kind === 'value') return { kind, a, p, t, answer: exponential(a, p, t) };
  if (kind === 'percent') return { kind, a, p, t: 1, answer: p };
  return { kind, a, p, t: 0, answer: characteristicTime(p) };
}

/** Erste Zahl in der Eingabe (Komma oder Punkt), sonst null. */
export function parseNumber(text: string): number | null {
  const m = text.replace(/\s/g, '').match(/[-−]?\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace('−', '-').replace(',', '.')) : null;
}

/** Richtig bei höchstens 0,5 % bzw. 0,011 Abweichung (Runden auf zwei Stellen ist erlaubt). */
export function checkGrowth(task: GrowthTask, text: string): { ok: boolean; got: number | null } {
  const got = parseNumber(text);
  return { ok: got !== null && Math.abs(got - task.answer) <= Math.max(0.011, 0.005 * Math.abs(task.answer)), got };
}
