import type { LevelInfo } from './levels';
import type { Grid, Part } from './model';

/**
 * Nebenbedingungen und Vergleich mit der Musterlösung (ohne Oberfläche,
 * getestet in tests/zahlenfabrik-regeln.test.ts).
 *
 * Rätsel können Bauteile verbieten („ohne Plus-Maschine“, `ban`) und die Zahl
 * der Bänder begrenzen („höchstens 5 Bänder“, `maxBelts`). Nach dem Sieg
 * vergleicht das Spiel die eigene Fabrik mit der kleinsten bekannten (`par`)
 * und merkt sich den persönlichen Bestwert – nur im eigenen Browser.
 */

/** Einfaches Band (keine Maschine, Weiche, Brücke …). */
export const isBeltPart = (p: Part) => !p.op && !p.sort && !p.merge && !p.split && !p.alt && !p.bridge;

/** Zahl der eigenen Bänder. */
export function beltCount(grid: Grid): number {
  let n = 0;
  for (const p of grid.values()) if (isBeltPart(p)) n += 1;
  return n;
}

/** So viele Bänder sind zu viel (0: Regel eingehalten oder keine Regel). */
export function beltsOver(level: LevelInfo, grid: Grid): number {
  return level.maxBelts === undefined ? 0 : Math.max(0, beltCount(grid) - level.maxBelts);
}

/**
 * Vergleich mit der Musterlösung: so viele Teile hat die eigene Fabrik mehr
 * (positiv), gleich viele (0) oder sogar weniger (negativ).
 */
export const overPar = (level: LevelInfo, parts: number) => parts - level.par;

/** Neuer Bestwert? (weniger Teile als bisher, oder noch keiner gespeichert) */
export const isNewBest = (old: number | undefined, parts: number) => old === undefined || parts < old;

/** Gespeicherte Bestwerte aufräumen: nur ganze Zahlen ab 0. */
export function cleanBest(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 10000) out[k] = v;
  return out;
}
