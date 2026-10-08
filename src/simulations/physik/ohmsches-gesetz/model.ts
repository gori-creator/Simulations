/**
 * Rechenlogik „Ohmsches Gesetz“.
 *
 * Ein regelbares Netzgerät (0 … 12 V, Strombegrenzung 2 A) liegt an einem
 * Bauteil. Amperemeter (in Reihe) und Voltmeter (parallel zum Bauteil)
 * messen Stromstärke I und Spannung U.
 *
 * Bauteile:
 *  - Festwiderstand (ohmsch): I = U / R,
 *  - Konstantandraht: R = ρ · l / A, nahezu temperaturunabhängig,
 *  - Glühlampe 12 V / 0,25 A: Die Wendel aus Wolfram erwärmt sich, ihr
 *    Widerstand steigt mit der Temperatur – die Kennlinie ist gekrümmt.
 *
 * Glühlampe: Gleichgewicht aus zugeführter Leistung U²/R(T) und
 * abgegebener Leistung (Strahlung ~ T⁴ und Wärmeleitung ~ ΔT). Der
 * Widerstand von Wolfram wächst etwa wie R ~ T^1,2.
 */

/** Spezifischer Widerstand von Konstantan in Ω·mm²/m. */
export const RHO_KONSTANTAN = 0.49;
/** Höchste Spannung des Netzgeräts in V. */
export const U_MAX = 12;
/** Strombegrenzung des Netzgeräts in A. */
export const I_LIMIT = 2;
/** Unbekannte Widerstände (Werte für Aufgaben, in Ω). */
export const MYSTERY = { A: 33, B: 82, C: 150 } as const;
export type MysteryId = keyof typeof MYSTERY;

/** Widerstand eines Drahtes: R = ρ · l / A (l in m, A in mm²). */
export function wireResistance(l: number, A: number, rho = RHO_KONSTANTAN): number {
  return (rho * l) / A;
}

/** Querschnittsfläche in mm² aus dem Durchmesser in mm. */
export function crossSection(d: number): number {
  return (Math.PI * d * d) / 4;
}

/* ---------- Glühlampe ---------- */

/** Nenndaten der Glühlampe. */
export const LAMP = { U: 12, I: 0.25, T: 2700 } as const;
export const ROOM_T = 293;
/** Exponent für den Widerstand von Wolfram: R ~ T^1,2. */
const TUNGSTEN_EXP = 1.2;
const R_NOMINAL = LAMP.U / LAMP.I;
/** Widerstand der kalten Wendel in Ω. */
export const R_COLD = R_NOMINAL / (LAMP.T / ROOM_T) ** TUNGSTEN_EXP;
const P_NOMINAL = LAMP.U * LAMP.I;
/** Bei Nennbetrieb geht etwa ein Zehntel der Leistung durch Wärmeleitung verloren, der Rest als Strahlung. */
const H_CONDUCTION = (0.1 * P_NOMINAL) / (LAMP.T - ROOM_T);
const C_RADIATION = (0.9 * P_NOMINAL) / (LAMP.T ** 4 - ROOM_T ** 4);

export function lampResistance(T: number): number {
  return R_COLD * (Math.max(ROOM_T, T) / ROOM_T) ** TUNGSTEN_EXP;
}

function lampLoss(T: number): number {
  return C_RADIATION * (T ** 4 - ROOM_T ** 4) + H_CONDUCTION * (T - ROOM_T);
}

/** Temperatur der Wendel bei der Spannung U (Gleichgewicht, Bisektion). */
export function lampTemperature(U: number): number {
  const u = Math.abs(U);
  if (u < 1e-9) return ROOM_T;
  let lo = ROOM_T;
  let hi = 4000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if ((u * u) / lampResistance(mid) > lampLoss(mid)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function lampCurrent(U: number): number {
  return U / lampResistance(lampTemperature(U));
}

/** Sichtbares Glühen 0…1 einer Wendel der Temperatur T (unter etwa 800 K unsichtbar). */
export function glowOf(T: number): number {
  const x = (T - 800) / (LAMP.T - 800);
  return x <= 0 ? 0 : Math.min(1.15, x * x);
}

/* ---------- Bauteile und Netzgerät ---------- */

export type PartKind = 'res' | 'mys' | 'lamp' | 'wire';

export interface PartSpec {
  kind: PartKind;
  /** Widerstand (Festwiderstand) in Ω. */
  R?: number;
  mystery?: MysteryId;
  /** Drahtlänge in m und Querschnitt in mm². */
  l?: number;
  A?: number;
}

/** Ohmscher Widerstand des Bauteils (null bei der Glühlampe). */
export function ohmicResistance(part: PartSpec): number | null {
  if (part.kind === 'res') return part.R ?? 100;
  if (part.kind === 'mys') return MYSTERY[part.mystery ?? 'A'];
  if (part.kind === 'wire') return wireResistance(part.l ?? 1, part.A ?? 0.1);
  return null;
}

/** Stromstärke durch das Bauteil bei der Spannung U. */
export function currentAt(part: PartSpec, U: number): number {
  const R = ohmicResistance(part);
  return R === null ? lampCurrent(U) : U / R;
}

export interface OperatingPoint {
  /** Spannung am Bauteil in V (Voltmeter). */
  U: number;
  /** Stromstärke in A (Amperemeter). */
  I: number;
  /** Greift die Strombegrenzung des Netzgeräts? */
  limited: boolean;
  /** Widerstand R = U / I in Ω (null bei U = 0). */
  R: number | null;
  /** Temperatur der Glühwendel in K (nur Glühlampe). */
  T: number;
}

/**
 * Arbeitspunkt bei der eingestellten Spannung. Würde die Stromstärke die
 * Strombegrenzung überschreiten, regelt das Netzgerät die Spannung so weit
 * herunter, dass genau I_LIMIT fließt.
 */
export function operatingPoint(part: PartSpec, Uset: number): OperatingPoint {
  let U = Math.max(0, Uset);
  let I = currentAt(part, U);
  let limited = false;
  if (I > I_LIMIT) {
    limited = true;
    let lo = 0;
    let hi = U;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (currentAt(part, mid) > I_LIMIT) hi = mid;
      else lo = mid;
    }
    U = (lo + hi) / 2;
    I = currentAt(part, U);
  }
  const T = part.kind === 'lamp' ? lampTemperature(U) : ROOM_T;
  return { U, I, limited, R: U > 1e-9 ? U / I : part.kind === 'lamp' ? R_COLD : ohmicResistance(part), T };
}

/* ---------- Messgeräte und Auswertung ---------- */

export const VOLT_RANGES = [1, 3, 10, 30] as const;
export const AMP_RANGES = [0.1, 0.3, 1, 3] as const;

/**
 * Automatische Wahl des Messbereichs mit Hysterese: Ein größerer Bereich,
 * sobald der Wert den aktuellen überschreitet; ein kleinerer erst, wenn der
 * Wert deutlich (unter 90 %) in ihn passt.
 */
export function autoRange(value: number, ranges: readonly number[], current: number): number {
  const v = Math.abs(value);
  let idx = Math.max(0, ranges.indexOf(current));
  while (idx < ranges.length - 1 && v > ranges[idx]!) idx++;
  while (idx > 0 && v < ranges[idx - 1]! * 0.9) idx--;
  return ranges[idx]!;
}

/** Steigung der Ursprungsgeraden durch Punkte (x, y): m = Σxy / Σx² (kleinste Quadrate). */
export function fitThroughOrigin(points: readonly { x: number; y: number }[]): number | null {
  let xy = 0;
  let xx = 0;
  for (const p of points) {
    xy += p.x * p.y;
    xx += p.x * p.x;
  }
  return xx > 1e-12 ? xy / xx : null;
}

/**
 * Farbcode eines Metallschichtwiderstands mit fünf Ringen: drei Ziffern und
 * Multiplikator (10^k), dazu Toleranz 1 % (braun). Werte unter 100 Ω mit
 * Multiplikator 0,1 (goldener Ring).
 */
export function colorBands(R: number): [number, number, number, number] {
  const r = Math.round(R);
  if (r < 100) {
    const v = Math.round(R * 10);
    return [Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10, -1];
  }
  let k = 0;
  let v = r;
  while (v >= 1000) {
    v = Math.round(v / 10);
    k++;
  }
  return [Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10, k];
}
