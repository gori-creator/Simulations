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

// ───────────────────────── Symmetrien ─────────────────────────

export type Relation = 'y' | 'o' | 'x';

/** Zugehöriger Winkel: Spiegelung an der y-Achse (180° − α), am Ursprung (180° + α), an der x-Achse (360° − α). */
export function relatedAngle(deg: number, rel: Relation): number {
  const a = rel === 'y' ? 180 - deg : rel === 'o' ? 180 + deg : 360 - deg;
  return ((a % 360) + 360) % 360;
}

// ───────────────────────── Gleichungen sin α = c, cos α = c ─────────────────────────

/** Lösungen in [0°; 360°) – aufsteigend, ohne doppelte (bei c = ±1 nur eine). */
export function solveTrig(fn: 'sin' | 'cos', c: number): number[] {
  if (c < -1 - 1e-12 || c > 1 + 1e-12) return [];
  const v = Math.max(-1, Math.min(1, c));
  const norm = (x: number) => {
    const r = ((Math.round(x * 1e9) / 1e9) % 360 + 360) % 360;
    return r >= 360 - 1e-9 ? 0 : r;
  };
  let sols: number[];
  if (fn === 'sin') {
    const a = (Math.asin(v) * 180) / Math.PI; // −90° … 90°
    sols = [norm(a), norm(180 - a)];
  } else {
    const a = (Math.acos(v) * 180) / Math.PI; // 0° … 180°
    sols = [norm(a), norm(360 - a)];
  }
  const out: number[] = [];
  for (const s of sols.sort((x, y) => x - y)) if (!out.some((o) => Math.abs(o - s) < 1e-7)) out.push(s);
  return out;
}

// ───────────────────────── Üben: Winkel am Einheitskreis finden ─────────────────────────

/** Besondere Winkel: Vielfache von 30° und 45° in [0°; 360°). */
export const SPECIAL_ANGLES: readonly number[] = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

export interface AngleTask {
  kind: 'angle' | 'values';
  /** gesuchter Winkel in Grad */
  answer: number;
  /** bei kind = 'values': gegebene Funktion und exakter Wert, dazu Vorzeichen der anderen */
  fn?: 'sin' | 'cos';
  value?: string;
  otherSign?: '+' | '−';
}

/** Reproduzierbare Aufgabe: entweder „Tippe auf α = …“ oder „sin α = …, cos α > 0“. */
export function angleTask(q: number, rand: () => number): AngleTask {
  const answer = SPECIAL_ANGLES[Math.floor(rand() * SPECIAL_ANGLES.length)]!;
  if (q % 2 === 1) return { kind: 'angle', answer };
  const fn: 'sin' | 'cos' = rand() < 0.5 ? 'sin' : 'cos';
  const r = (answer * Math.PI) / 180;
  const other = fn === 'sin' ? Math.cos(r) : Math.sin(r);
  // Eindeutig nur, wenn die andere Funktion nicht 0 ist; sonst reicht der Wert allein (±1).
  const value = exactTrig(answer, fn)!;
  if (Math.abs(other) < 1e-9) return { kind: 'values', answer, fn, value };
  return { kind: 'values', answer, fn, value, otherSign: other > 0 ? '+' : '−' };
}

/** Passt der angetippte Winkel zur Aufgabe? (bei Wertangaben zählt jeder Winkel mit denselben Werten) */
export function checkAngle(task: AngleTask, deg: number): boolean {
  if (task.kind === 'angle') return Math.abs(((deg - task.answer) % 360 + 360) % 360) < 1e-6;
  const r = (deg * Math.PI) / 180;
  const a = (task.answer * Math.PI) / 180;
  return Math.abs(Math.sin(r) - Math.sin(a)) < 1e-9 && Math.abs(Math.cos(r) - Math.cos(a)) < 1e-9;
}
