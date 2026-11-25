/**
 * Solarzelle und Solarmodule: Kennlinie nach dem Ein-Dioden-Modell,
 * Reihen- und Parallelschaltung, Bestrahlungsstärke, Einfallswinkel,
 * Verschattung, Arbeitspunkt mit Lastwiderstand und Punkt maximaler Leistung.
 */

/** Schulmodul: Kurzschlussstrom bei 1000 W/m² in A und Zahl der Zellen in Reihe. */
export const ISC_STC = 0.5;
export const CELLS = 4;
/** Sperrsättigungsstrom einer Zelle in A und Temperaturspannung·Idealitätsfaktor in V. */
export const I0 = 1e-8;
export const NVT = 0.0257 * 1.3;

export interface Array {
  /** Module in Reihe je Strang. */
  series: number;
  /** Stränge parallel. */
  parallel: number;
  /** Bestrahlungsstärke in W/m². */
  E: number;
  /** Winkel zwischen Sonnenstrahlen und Modulsenkrechter in °. */
  angle: number;
  /** Verschatteter Anteil des ersten Moduls im ersten Strang (0 … 1). */
  shade: number;
}

/** Fotostrom eines Moduls in A. */
export function photoCurrent(E: number, angleDeg: number, shade = 0): number {
  const c = Math.max(0, Math.cos((angleDeg * Math.PI) / 180));
  return ISC_STC * (E / 1000) * c * (1 - shade);
}

/** Spannung eines Moduls bei Strom I (A); −∞, wenn I den Fotostrom übersteigt (keine Bypass-Diode). */
export function moduleVoltage(I: number, Iph: number): number {
  if (I >= Iph + I0) return -Infinity;
  return CELLS * NVT * Math.log((Iph - I) / I0 + 1);
}

/** Leerlaufspannung eines Moduls. */
export function moduleVoc(Iph: number): number {
  return moduleVoltage(0, Iph);
}

/** Strom eines Strangs bei Spannung U (Bisektion über den Strom). */
export function stringCurrent(U: number, iphs: readonly number[]): number {
  const Imax = Math.min(...iphs);
  if (Imax <= 0) return 0;
  const volt = (I: number) => iphs.reduce((s, ip) => s + moduleVoltage(I, ip), 0);
  if (U <= 0) return Imax; // näherungsweise Kurzschlussstrom
  if (volt(0) <= U) return 0;
  let lo = 0;
  let hi = Imax;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (volt(mid) > U) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Fotoströme aller Module eines Strangs. */
function stringIph(a: Array, k: number): number[] {
  const out: number[] = [];
  for (let m = 0; m < a.series; m++) out.push(photoCurrent(a.E, a.angle, k === 0 && m === 0 ? a.shade : 0));
  return out;
}

/** Strom der ganzen Anlage bei Spannung U. */
export function arrayCurrent(U: number, a: Array): number {
  let I = 0;
  for (let k = 0; k < a.parallel; k++) I += stringCurrent(U, stringIph(a, k));
  return I;
}

/** Leerlaufspannung der Anlage. */
export function arrayVoc(a: Array): number {
  let v = 0;
  for (let k = 0; k < a.parallel; k++) v = Math.max(v, stringIph(a, k).reduce((s, ip) => s + moduleVoc(ip), 0));
  return v;
}

/** Arbeitspunkt mit Lastwiderstand R: I(U) = U/R. */
export function operatingPoint(a: Array, R: number): { U: number; I: number } {
  let lo = 0;
  let hi = arrayVoc(a);
  if (hi <= 0) return { U: 0, I: 0 };
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (arrayCurrent(mid, a) > mid / R) lo = mid;
    else hi = mid;
  }
  const U = (lo + hi) / 2;
  return { U, I: U / R };
}

/** Punkt maximaler Leistung (MPP). */
export function maxPower(a: Array): { U: number; I: number; P: number } {
  const voc = arrayVoc(a);
  let best = { U: 0, I: 0, P: 0 };
  for (let i = 0; i <= 400; i++) {
    const U = (voc * i) / 400;
    const I = arrayCurrent(U, a);
    if (U * I > best.P) best = { U, I, P: U * I };
  }
  return best;
}
