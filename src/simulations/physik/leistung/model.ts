/**
 * Mechanische Arbeit und Leistung beim Treppensteigen und Vergleich mit
 * typischen Leistungen von Geräten und Maschinen.
 */

export const G = 9.81;
/** 1 PS in Watt. */
export const PS = 735.5;

/** Hubarbeit W = m·g·h in J. */
export function work(m: number, h: number): number {
  return m * G * h;
}

/** Leistung P = W/t in W. */
export function power(m: number, h: number, t: number): number {
  return work(m, h) / t;
}

export interface Reference {
  id: string;
  /** Leistung in W. */
  P: number;
  de: string;
  en: string;
}

/** Typische Leistungen zum Vergleich (gerundete Richtwerte). */
export const REFERENCES: readonly Reference[] = [
  { id: 'handy', P: 5, de: 'Handy laden', en: 'charging a phone' },
  { id: 'led', P: 10, de: 'LED-Lampe', en: 'LED lamp' },
  { id: 'dauer', P: 100, de: 'Mensch, stundenlang', en: 'human, for hours' },
  { id: 'pferd', P: 736, de: 'Pferd (1 PS)', en: 'horse (1 hp)' },
  { id: 'koch', P: 2000, de: 'Wasserkocher', en: 'kettle' },
  { id: 'auto', P: 100000, de: 'Auto', en: 'car' },
  { id: 'ice', P: 8000000, de: 'ICE-Zug', en: 'high-speed train' },
];
