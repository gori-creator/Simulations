/**
 * Lektion „Bilder sind Zahlen“: Ein Bild aus 7 × 7 Kästchen ist für Bit eine
 * Liste aus 49 Zahlen (1 = Kästchen ausgemalt, 0 = leer).
 */
export const SIZE = 7;

const parse = (rows: string[]): number[] => rows.join('').split('').map(Number);

/** Smiley, das Bit als Zahlen schickt. */
export const SMILEY = parse(['0000000', '0100010', '0100010', '0000000', '1000001', '0111110', '0000000']);

/** Wie viele Kästchen stimmen überein? */
export function sameCells(a: readonly number[], b: readonly number[]): number {
  return a.reduce((n, v, i) => n + (v === b[i] ? 1 : 0), 0);
}

/** Zeilen als Zahlentext, z. B. „0 1 0 0 0 1 0“. */
export function rowsOf(cells: readonly number[], size = SIZE): string[] {
  const out: string[] = [];
  for (let r = 0; r < size; r++) out.push(cells.slice(r * size, r * size + size).join(' '));
  return out;
}
