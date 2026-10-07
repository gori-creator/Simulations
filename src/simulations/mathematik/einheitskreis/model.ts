/**
 * Rechenlogik der Simulation „Einheitskreis“.
 */

/** Exakte Werte für besondere Winkel (Vielfache von 30° und 45°), sonst `null`. */
export function exactTrig(deg: number, fn: 'sin' | 'cos' | 'tan'): string | null {
  const a = ((Math.round(deg * 1000) / 1000) % 360 + 360) % 360;
  const table: Record<number, [string, string, string]> = {
    0: ['0', '1', '0'],
    30: ['1/2', '√3/2', '√3/3'],
    45: ['√2/2', '√2/2', '1'],
    60: ['√3/2', '1/2', '√3'],
    90: ['1', '0', '–'],
    120: ['√3/2', '−1/2', '−√3'],
    135: ['√2/2', '−√2/2', '−1'],
    150: ['1/2', '−√3/2', '−√3/3'],
    180: ['0', '−1', '0'],
    210: ['−1/2', '−√3/2', '√3/3'],
    225: ['−√2/2', '−√2/2', '1'],
    240: ['−√3/2', '−1/2', '√3'],
    270: ['−1', '0', '–'],
    300: ['−√3/2', '1/2', '−√3'],
    315: ['−√2/2', '√2/2', '−1'],
    330: ['−1/2', '√3/2', '−√3/3'],
  };
  const row = table[a];
  if (!row) return null;
  return row[fn === 'sin' ? 0 : fn === 'cos' ? 1 : 2];
}

/** Quadrant 1–4 eines Winkels in Grad; 0 auf einer Achse. */
export function quadrant(deg: number): 0 | 1 | 2 | 3 | 4 {
  const a = ((deg % 360) + 360) % 360;
  if (a % 90 === 0) return 0;
  return (Math.floor(a / 90) + 1) as 1 | 2 | 3 | 4;
}

/** Ist der Tangens definiert? (nicht bei 90° + k·180°) */
export function tanDefined(deg: number): boolean {
  return Math.abs(Math.cos((deg * Math.PI) / 180)) > 1e-9;
}
