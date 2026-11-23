/**
 * Messen und Messunsicherheit: reine Rechenlogik.
 * Längen werden in cm, Zeiten in s angegeben. Eine Standardunsicherheit
 * ist kein garantierter Fehlerbereich. Statistische Unsicherheit setzt
 * unabhängige Wiederholungen unter gleichen Bedingungen voraus.
 */
export const MAX_POINTS = 20;
export const VALUE_LIMIT = 100;
export const DEFAULT_DATA = '9.8; 10.1; 9.9; 10.2; 10.0';
export const FIT_DATA = '1.1; 2.8; 5.2; 6.9; 9.0';
export type ParseError = 'empty' | 'number' | 'range' | 'count';
export interface ParsedData { values: number[]; error: ParseError | null }

/** Semikolon oder Zeilenumbruch trennt Werte; Komma ODER Punkt ist Dezimalzeichen. */
export function parseData(input: string): ParsedData {
  if (!input.trim()) return { values: [], error: 'empty' };
  const tokens = input.trim().split(/[;\n]/).map((s) => s.trim());
  if (tokens.length > MAX_POINTS) return { values: [], error: 'count' };
  const values: number[] = [];
  for (const token of tokens) {
    if (!/^[+−-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(token)) return { values: [], error: 'number' };
    const value = Number(token.replace(',', '.').replace('−', '-'));
    if (!Number.isFinite(value) || Math.abs(value) > VALUE_LIMIT) return { values: [], error: 'range' };
    values.push(value);
  }
  return { values, error: null };
}

/** URL-taugliche Schreibweise; Rundung nur beim Speichern eines bedienten Reglers. */
export function serializeData(values: readonly number[]): string {
  return values.map((v) => Number(v.toFixed(3))).join('; ');
}

export interface Statistics {
  n: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  sumSquares: number;
  sampleSD: number | null;
  sem: number | null;
}

/** Zentrierte Zweipass-Auswertung mit n−1 (empirische Standardabweichung). */
export function statistics(values: readonly number[]): Statistics {
  if (!values.every(Number.isFinite)) throw new RangeError('Messwerte müssen endlich sein.');
  const n = values.length;
  if (!n) return { n, mean: null, min: null, max: null, sumSquares: 0, sampleSD: null, sem: null };
  const origin = values[0]!;
  const mean = origin + values.reduce((s, x) => s + (x - origin), 0) / n;
  const sumSquares = values.reduce((s, x) => s + (x - mean) ** 2, 0);
  const sampleSD = n > 1 ? Math.sqrt(sumSquares / (n - 1)) : null;
  return { n, mean, min: Math.min(...values), max: Math.max(...values), sumSquares, sampleSD, sem: sampleSD === null ? null : sampleSD / Math.sqrt(n) };
}

/** Gleichverteilte Rundungsabweichung in [−d/2,d/2]: u_B = d/√12. */
export function resolutionUncertainty(step: number): number {
  if (!Number.isFinite(step) || step < 0) throw new RangeError('Teilung muss nichtnegativ sein.');
  return step / Math.sqrt(12);
}

/** Unabhängige Standardunsicherheiten quadratisch kombinieren (vereinfachtes Modell). */
export function combinedUncertainty(sem: number | null, resolution: number): number | null {
  return sem === null ? null : Math.hypot(sem, resolutionUncertainty(resolution));
}

/** Ablesung auf die gewählte Skalenauflösung runden; Offset ist systematisch. */
export function instrumentReading(length: number, offset: number, step: number): number {
  if (!(step > 0) || ![length, offset, step].every(Number.isFinite)) throw new RangeError('Ungültige Skala.');
  return Math.round((length + offset) / step) * step;
}

export interface Point { x: number; y: number }
export interface LinearFit {
  slope: number;
  intercept: number;
  residuals: number[];
  sse: number;
  rSquared: number | null;
  residualSD: number | null;
  slopeSE: number | null;
  interceptSE: number | null;
  meanX: number;
  sxx: number;
}

/**
 * Ungewichtete kleinste Quadrate y = a·x+b. x gilt als exakt, alle y haben
 * gleiche unabhängige Unsicherheit. Gleiche x-Werte: keine eindeutige Gerade.
 */
export function linearFit(points: readonly Point[]): LinearFit | null {
  if (points.length < 2 || !points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) return null;
  const xs = statistics(points.map((p) => p.x));
  const ys = statistics(points.map((p) => p.y));
  const meanX = xs.mean!;
  const meanY = ys.mean!;
  const sxx = xs.sumSquares;
  if (sxx === 0) return null;
  const sxy = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const residuals = points.map((p) => p.y - (slope * p.x + intercept));
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const residualSD = points.length > 2 ? Math.sqrt(sse / (points.length - 2)) : null;
  return {
    slope, intercept, residuals, sse,
    rSquared: ys.sumSquares > 0 ? Math.max(0, Math.min(1, 1 - sse / ys.sumSquares)) : null,
    residualSD, slopeSE: residualSD === null ? null : residualSD / Math.sqrt(sxx),
    interceptSE: residualSD === null ? null : residualSD * Math.sqrt(1 / points.length + meanX ** 2 / sxx), meanX, sxx,
  };
}

/** Messung in gleichen Zeitabständen (auch dt=0 ist als Sonderfall erlaubt). */
export function timedPoints(values: readonly number[], dt: number): Point[] {
  return values.map((y, i) => ({ x: i * dt, y }));
}

/** Standardunsicherheit des geschätzten Mittelwerts der Geraden am Ort x. */
export function fitUncertainty(fit: LinearFit, n: number, x: number): number | null {
  return fit.residualSD === null ? null : fit.residualSD * Math.sqrt(1 / n + (x - fit.meanX) ** 2 / fit.sxx);
}

/** Reproduzierbare, normalverteilte Beispielmessungen (Box–Muller). Keine Echtdaten. */
export function sampleMeasurements(n: number, center: number, sigma: number, offset: number, seed: number, slope = 0, dt = 1): number[] {
  let state = seed >>> 0;
  const random = () => { state = (1664525 * state + 1013904223) >>> 0; return (state + 0.5) / 4294967296; };
  return Array.from({ length: n }, (_, i) => {
    const z = Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
    return Math.max(-VALUE_LIMIT, Math.min(VALUE_LIMIT, Math.round((center + slope * i * dt + offset + sigma * z) * 1000) / 1000));
  });
}

export interface Bin { from: number; to: number; count: number }
/** Histogramm inklusive rechtem Endpunkt, bei identischen Werten mit Mindestbreite. */
export function histogram(values: readonly number[], count = 6): Bin[] {
  if (!values.length) return [];
  const n = Math.max(1, Math.floor(count));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = Math.max(max - min, 0.2);
  const lo = min === max ? min - width / 2 : min;
  const step = width / n;
  const bins = Array.from({ length: n }, (_, i) => ({ from: lo + i * step, to: lo + (i + 1) * step, count: 0 }));
  for (const value of values) bins[Math.min(n - 1, Math.max(0, Math.floor((value - lo) / step)))]!.count++;
  return bins;
}

/** Lesbarer Diagrammbereich: alle Daten und Fehlerbalken enthalten. */
export function dataRange(values: readonly number[], padding = 0.2): [number, number] {
  if (!values.length) return [0, 1];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const margin = Math.max((hi - lo) * 0.14, padding);
  return [lo - margin, hi + margin];
}

/** Quadratsumme für eine beliebige, selbst gelegte Gerade. */
export function squaredResiduals(points: readonly Point[], slope: number, intercept: number): number {
  return points.reduce((sum, point) => sum + (point.y - slope * point.x - intercept) ** 2, 0);
}

export interface RepeatExperiment {
  means: number[];
  theoreticalSEM: number;
  expectedMean: number;
  covered: number;
}

/**
 * Viele unabhängige Messreihen desselben idealen Experiments. Eine Reihe
 * enthält n normalverteilte Einzelmessungen. Hier wird nichts gerundet oder
 * abgeschnitten: Die Formeln für die Normalverteilung gelten exakt.
 */
export function repeatedExperiments(n: number, sigma: number, offset: number, seed: number, repeats = 40, reference = 10): RepeatExperiment {
  if (!Number.isInteger(n) || n < 1 || !Number.isFinite(sigma) || sigma < 0 || !Number.isFinite(offset)) throw new RangeError('Ungültiger Versuch.');
  let state = seed >>> 0;
  const random = () => { state = (1664525 * state + 1013904223) >>> 0; return (state + 0.5) / 4294967296; };
  const means = Array.from({ length: repeats }, () => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
    return reference + offset + sigma * sum / n;
  });
  const theoreticalSEM = sigma / Math.sqrt(n);
  return { means, theoreticalSEM, expectedMean: reference + offset, covered: means.filter((mean) => Math.abs(mean - reference) <= theoreticalSEM + 1e-12).length };
}

/** Dichte der Normalverteilung; bei σ=0 existiert keine endliche Dichtekurve. */
export function normalDensity(x: number, mean: number, sigma: number): number | null {
  if (!(sigma > 0)) return null;
  const z = (x - mean) / sigma;
  return Math.exp(-z * z / 2) / (sigma * Math.sqrt(2 * Math.PI));
}

export interface CalculationStep { index: number; value: number; deviation: number; square: number; partialSquareSum: number }
/** Schrittweise Tabelle für die Nachrechnung; die vollständige Reihe bestimmt x̄. */
export function calculationSteps(values: readonly number[]): CalculationStep[] {
  const mean = statistics(values).mean;
  if (mean === null) return [];
  let partialSquareSum = 0;
  return values.map((value, index) => {
    const deviation = value - mean;
    const square = deviation ** 2;
    partialSquareSum += square;
    return { index, value, deviation, square, partialSquareSum };
  });
}

/** Gut ablesbare Teilung, mit optional ganzzahligen Versuchsnummern. */
export function axisTicks(lo: number, hi: number, target = 4, integers = false): number[] {
  const raw = (hi - lo) / target;
  if (!(raw > 0) || !Number.isFinite(raw)) return [];
  const power = 10 ** Math.floor(Math.log10(raw));
  const multiplier = [1, 2, 5, 10].find((v) => v * power >= raw) ?? 10;
  const step = Math.max(integers ? 1 : 0, multiplier * power);
  const result: number[] = [];
  for (let index = Math.ceil(lo / step - 1e-10); index * step <= hi + step * 1e-10; index++) {
    result.push(Number((index * step).toPrecision(12)));
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Messschieber mit Nonius                                              */
/* ------------------------------------------------------------------ */

export type NoniusKind = '0.1' | '0.05';
export interface NoniusScale {
  /** Zahl der Noniusteilstriche (Intervalle) */
  divisions: number;
  /** Länge des Nonius in mm (10 Teile auf 9 mm bzw. 20 Teile auf 39 mm) */
  length: number;
  /** Auflösung in mm */
  resolution: number;
}

/** Klassische Noniusteilungen: 1/10 mm (10 Teile auf 9 mm) und 1/20 mm (20 Teile auf 39 mm). */
export function noniusScale(kind: NoniusKind): NoniusScale {
  return kind === '0.1' ? { divisions: 10, length: 9, resolution: 0.1 } : { divisions: 20, length: 39, resolution: 0.05 };
}

export interface NoniusReading {
  /** ganze Millimeter vor dem Nullstrich des Nonius */
  mainMm: number;
  /** Nummer des Noniusstrichs, der mit einem Strich der Hauptskala zusammenfällt */
  k: number;
  /** abgelesener Wert in mm */
  reading: number;
}

/**
 * Ablesung am Messschieber: ganze Millimeter links vom Noniusnullstrich plus
 * k · Auflösung, wobei k der Noniusstrich ist, der am besten mit einem
 * Hauptskalenstrich zusammenfällt.
 */
export function noniusReading(lengthMm: number, kind: NoniusKind): NoniusReading {
  const s = noniusScale(kind);
  const steps = Math.round(lengthMm / s.resolution + 1e-9);
  const rounded = steps * s.resolution;
  const mainMm = Math.floor(rounded + 1e-9);
  const k = Math.round((rounded - mainMm) / s.resolution);
  return { mainMm, k: k % s.divisions, reading: Number((mainMm + (k % s.divisions) * s.resolution).toFixed(3)) };
}

/** Lage des k-ten Noniusstrichs (mm, ab Nullpunkt der Hauptskala) bei Schieberstellung x. */
export const noniusLine = (x: number, k: number, kind: NoniusKind) => x + (k * noniusScale(kind).length) / noniusScale(kind).divisions;

/** Abstand des k-ten Noniusstrichs zum nächsten Hauptskalenstrich (mm). */
export function noniusMismatch(x: number, k: number, kind: NoniusKind): number {
  const pos = noniusLine(x, k, kind);
  return Math.abs(pos - Math.round(pos));
}

/* ------------------------------------------------------------------ */
/* Fortpflanzung von Unsicherheiten                                     */
/* ------------------------------------------------------------------ */

export type FormulaId = 'area' | 'speed' | 'density' | 'pendulum';
export interface FormulaDef {
  id: FormulaId;
  /** Vorfaktor c in f = c · x₁^e₁ · x₂^e₂ */
  c: number;
  exps: [number, number];
}

export const FORMULAS: Record<FormulaId, FormulaDef> = {
  area: { id: 'area', c: 1, exps: [1, 1] },
  speed: { id: 'speed', c: 1, exps: [1, -1] },
  density: { id: 'density', c: 1, exps: [1, -1] },
  pendulum: { id: 'pendulum', c: 4 * Math.PI * Math.PI, exps: [1, -2] },
};

export interface Propagation {
  value: number;
  /** Beiträge (eᵢ · uᵢ/xᵢ) jeder Eingangsgröße, relativ */
  contributions: [number, number];
  /** relative Unsicherheit nach Gauß (quadratisch addiert) */
  relGauss: number;
  /** relative Größtunsicherheit (Beträge addiert) */
  relMax: number;
  uGauss: number;
  uMax: number;
  /** Index der Größe mit dem größten Beitrag */
  dominant: 0 | 1;
}

/**
 * Potenzprodukt f = c · x₁^e₁ · x₂^e₂ mit unabhängigen Unsicherheiten:
 * u(f)/|f| = √Σ (eᵢ·uᵢ/xᵢ)² (Gauß) bzw. Σ |eᵢ|·uᵢ/|xᵢ| (Größtfehler).
 */
export function propagate(f: FormulaDef, x: [number, number], u: [number, number]): Propagation | null {
  if (x.some((v) => !Number.isFinite(v) || v === 0) || u.some((v) => !Number.isFinite(v) || v < 0)) return null;
  const value = f.c * x[0] ** f.exps[0] * x[1] ** f.exps[1];
  const contributions: [number, number] = [Math.abs((f.exps[0] * u[0]) / x[0]), Math.abs((f.exps[1] * u[1]) / x[1])];
  const relGauss = Math.hypot(contributions[0], contributions[1]);
  const relMax = contributions[0] + contributions[1];
  return { value, contributions, relGauss, relMax, uGauss: Math.abs(value) * relGauss, uMax: Math.abs(value) * relMax, dominant: contributions[0] >= contributions[1] ? 0 : 1 };
}

/** Anteil an der Varianz (Gauß), 0 … 1. */
export function varianceShares(p: Propagation): [number, number] {
  const a = p.contributions[0] ** 2;
  const b = p.contributions[1] ** 2;
  const s = a + b;
  return s === 0 ? [0, 0] : [a / s, b / s];
}

/**
 * Ergebnis mit Unsicherheit sinnvoll runden: Unsicherheit auf 2 geltende
 * Ziffern, wenn ihre erste Ziffer 1 oder 2 ist, sonst auf 1; der Wert auf
 * dieselbe Dezimalstelle.
 */
export function roundResult(value: number, u: number): { value: number; u: number; decimals: number } {
  if (!(u > 0) || !Number.isFinite(u)) return { value, u: 0, decimals: 3 };
  const exp = Math.floor(Math.log10(u));
  const lead = Math.floor(u / 10 ** exp);
  const sig = lead <= 2 ? 2 : 1;
  const decimals = Math.max(0, sig - 1 - exp);
  const factor = 10 ** (sig - 1 - exp);
  const ru = Math.ceil(u * factor - 1e-9) / factor;
  // nach dem Aufrunden kann eine Stelle hinzukommen (0,099 → 0,1)
  const rv = Math.round(value * factor) / factor;
  return { value: Number(rv.toFixed(Math.max(0, decimals))), u: Number(ru.toFixed(Math.max(0, decimals))), decimals };
}

/** Monte-Carlo-Probe: n Ergebnisse aus normalverteilten Eingangswerten. */
export function monteCarlo(f: FormulaDef, x: [number, number], u: [number, number], n: number, seed: number): number[] {
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 0.5) / 4294967296;
  };
  const gauss = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = x[0] + u[0] * gauss();
    const b = x[1] + u[1] * gauss();
    const v = f.c * a ** f.exps[0] * b ** f.exps[1];
    if (Number.isFinite(v)) out.push(v);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Zeit stoppen: Reaktionszeit                                          */
/* ------------------------------------------------------------------ */

/** Periodendauer des Beispielpendels (l = 1 m, g = 9,81 m/s²): T = 2π·√(l/g). */
export const PENDULUM_T = 2 * Math.PI * Math.sqrt(1 / 9.81);

/** Aus der gestoppten Zeit für n Schwingungen die Periodendauer. */
export function periodFromStops(total: number, n: number): number {
  if (!(n > 0) || !Number.isFinite(total)) throw new RangeError('Ungültige Messung.');
  return total / n;
}

/**
 * Simulierte Stoppuhrmessungen über n Schwingungen: Start- und Stopp-Druck
 * kommen je mit einer zufälligen Reaktionsverzögerung (Mittel mu, Streuung sd).
 * Gleiche mittlere Verzögerungen heben sich auf; übrig bleibt die Streuung,
 * die sich auf n Perioden verteilt: u(T) ≈ √2·sd / n.
 */
export function simulatedStops(n: number, count: number, seed: number, mu = 0.2, sd = 0.06, period = PENDULUM_T): number[] {
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 0.5) / 4294967296;
  };
  const gauss = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  return Array.from({ length: count }, () => {
    const startDelay = Math.max(0.05, mu + sd * gauss());
    const stopDelay = Math.max(0.05, mu + sd * gauss());
    return Math.round((n * period - startDelay + stopDelay) * 100) / 100;
  });
}

/** Erwartete Standardunsicherheit von T bei n gestoppten Schwingungen. */
export const stopUncertainty = (n: number, sd = 0.06) => (Math.SQRT2 * sd) / n;
