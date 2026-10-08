/**
 * Rechenlogik „Einfacher Stromkreis“.
 *
 * Eine Flachbatterie (4,5 V) mit kleinem Innenwiderstand treibt den Strom
 * durch ein elektrisches Gerät (Glühlampe, Elektromotor oder Klingel). Im
 * Stromkreis können außerdem liegen:
 *  - ein Schalter (offen oder geschlossen),
 *  - eine Prüfstrecke mit einem Gegenstand (Leiter oder Nichtleiter),
 *  - eine Feinsicherung, die bei zu großer Stromstärke durchschmilzt,
 *  - eine Leitung direkt über das Gerät (Kurzschluss).
 *
 * Alle Bauteile werden als ohmsche Widerstände beschrieben (Glühlampe mit
 * dem Widerstand im Betrieb, Motor ohne Gegenspannung). Das genügt für die
 * qualitative Betrachtung in Klasse 7/8 und liefert realistische Größen-
 * ordnungen für die Stromstärken.
 */

export type Device = 'lamp' | 'motor' | 'bell';
export type MaterialId = 'clip' | 'coin' | 'foil' | 'lead' | 'wood' | 'eraser' | 'ruler' | 'glass';

/** Spannung der Flachbatterie in V. */
export const BATTERY_U = 4.5;
/** Innenwiderstand der Batterie in Ω. */
export const BATTERY_R = 0.7;
/** Widerstand der Leitung, die das Gerät überbrückt, in Ω. */
export const BRIDGE_R = 0.03;
/** Widerstand der Feinsicherung in Ω (vernachlässigbar klein). */
export const FUSE_R = 0.05;
/** Nennstromstärke der Feinsicherung in A: darüber schmilzt sie durch. */
export const FUSE_RATING = 1;

/** Widerstand der Geräte im Betrieb in Ω (Glühlampe 4,5 V / 0,3 A). */
export const DEVICE_R: Record<Device, number> = { lamp: 15, motor: 18, bell: 22 };
/** Nennleistung der Glühlampe in W (4,5 V · 0,3 A). */
export const LAMP_P_NOMINAL = (BATTERY_U * BATTERY_U) / DEVICE_R.lamp;

export interface Material {
  /** Leitet der Gegenstand den elektrischen Strom? */
  conductor: boolean;
  /** Widerstand zwischen den beiden Klemmen in Ω (Nichtleiter: unendlich). */
  R: number;
}

/**
 * Gegenstände für die Prüfstrecke. Metalle leiten sehr gut, Graphit
 * (Bleistiftmine) leitet merklich schlechter: Eine etwa 4 cm lange Mine mit
 * 0,5 mm Durchmesser hat einige Ohm Widerstand – die Lampe leuchtet schwächer.
 */
export const MATERIALS: Record<MaterialId, Material> = {
  clip: { conductor: true, R: 0.02 },
  coin: { conductor: true, R: 0.001 },
  foil: { conductor: true, R: 0.01 },
  lead: { conductor: true, R: 6 },
  wood: { conductor: false, R: Infinity },
  eraser: { conductor: false, R: Infinity },
  ruler: { conductor: false, R: Infinity },
  glass: { conductor: false, R: Infinity },
};

export const MATERIAL_IDS = Object.keys(MATERIALS) as MaterialId[];

export interface CircuitInput {
  device: Device;
  /** Ist der Stromkreis an Schalter bzw. Prüfstrecke geschlossen? */
  closed: boolean;
  /** Zusätzlicher Widerstand in Reihe (Prüfstrecke) in Ω; unendlich = Nichtleiter. */
  seriesR?: number;
  /** Leitung parallel zum Gerät (Kurzschluss). */
  bridge?: boolean;
  /** Sicherung: keine, intakt oder durchgeschmolzen. */
  fuse?: 'none' | 'ok' | 'blown';
}

export interface CircuitResult {
  /** Stromstärke durch die Batterie in A. */
  I: number;
  /** Stromstärke durch das Gerät in A. */
  Idevice: number;
  /** Stromstärke durch die überbrückende Leitung in A. */
  Ibridge: number;
  /** Spannung am Gerät in V. */
  Udevice: number;
  /** Elektrische Leistung des Geräts in W. */
  Pdevice: number;
  /** Kurzschluss: Die Pole sind über einen Leiter mit fast keinem Widerstand verbunden. */
  short: boolean;
}

const ZERO: CircuitResult = { I: 0, Idevice: 0, Ibridge: 0, Udevice: 0, Pdevice: 0, short: false };

/** Stromstärken im Stromkreis (unverzweigt, ggf. mit Überbrückung des Geräts). */
export function solveCircuit(input: CircuitInput): CircuitResult {
  const seriesR = input.seriesR ?? 0;
  const fuse = input.fuse ?? 'none';
  if (!input.closed || fuse === 'blown' || !Number.isFinite(seriesR)) return { ...ZERO };
  const Rd = DEVICE_R[input.device];
  const bridge = !!input.bridge;
  // Gerät und Überbrückung liegen parallel: 1/R = 1/R_Gerät + 1/R_Leitung
  const Rload = bridge ? (Rd * BRIDGE_R) / (Rd + BRIDGE_R) : Rd;
  const Rtotal = BATTERY_R + seriesR + (fuse === 'ok' ? FUSE_R : 0) + Rload;
  const I = BATTERY_U / Rtotal;
  const Udevice = I * Rload;
  const Idevice = Udevice / Rd;
  const Ibridge = bridge ? Udevice / BRIDGE_R : 0;
  return { I, Idevice, Ibridge, Udevice, Pdevice: Udevice * Idevice, short: bridge };
}

/** Schmilzt die Sicherung bei dieser Stromstärke durch? */
export function fuseBlows(I: number): boolean {
  return I > FUSE_RATING;
}

/** Raumtemperatur in K. */
export const ROOM_T = 293;
/** Temperatur der Glühwendel bei Nennleistung in K. */
export const NOMINAL_T = 2700;

/**
 * Temperatur der Glühwendel: Die Wendel gibt ihre Energie vor allem als
 * Strahlung ab (Stefan-Boltzmann, P ~ T⁴), also T ≈ T_N · (P/P_N)^(1/4).
 */
export function filamentTemperature(P: number, Pnominal: number): number {
  if (!(P > 0) || !(Pnominal > 0)) return ROOM_T;
  return Math.max(ROOM_T, NOMINAL_T * (P / Pnominal) ** 0.25);
}

/**
 * Sichtbares Leuchten 0…1 einer Glühwendel der Temperatur T: Unter etwa
 * 800 K glüht sie nicht sichtbar, darüber wird sie rasch heller.
 */
export function glowOf(T: number): number {
  const x = (T - 800) / (NOMINAL_T - 800);
  return x <= 0 ? 0 : Math.min(1.15, x * x);
}
