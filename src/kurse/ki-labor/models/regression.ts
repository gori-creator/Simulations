/**
 * Lektionen „Die beste Gerade“ und „Gradientenabstieg“: lineare Regression
 * mit der mittleren quadratischen Abweichung (MSE) als Fehlerfunktion.
 * Daten: Lernzeit in Stunden und Punkte in einem Test (erfunden, plausibel).
 */
export interface Pt {
  x: number;
  y: number;
}

export const DATA: Pt[] = [
  { x: 0.5, y: 34 },
  { x: 1, y: 38 },
  { x: 1.2, y: 51 },
  { x: 1.5, y: 47 },
  { x: 2, y: 60 },
  { x: 2.5, y: 58 },
  { x: 2.8, y: 71 },
  { x: 3, y: 66 },
  { x: 3.5, y: 80 },
  { x: 4, y: 79 },
];

/** Mittlere quadratische Abweichung der Geraden y = m·x + b. */
export function mse(m: number, b: number, data: readonly Pt[] = DATA): number {
  return data.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0) / data.length;
}

/** Beste Gerade (Normalgleichung). */
export function fit(data: readonly Pt[] = DATA): { m: number; b: number } {
  const n = data.length;
  const mx = data.reduce((s, p) => s + p.x, 0) / n;
  const my = data.reduce((s, p) => s + p.y, 0) / n;
  const sxy = data.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const sxx = data.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const m = sxy / sxx;
  return { m, b: my - m * mx };
}

/** Gradient der MSE nach (m, b). */
export function gradient(m: number, b: number, data: readonly Pt[] = DATA): { dm: number; db: number } {
  const n = data.length;
  let dm = 0;
  let db = 0;
  for (const p of data) {
    const r = m * p.x + b - p.y;
    dm += (2 / n) * r * p.x;
    db += (2 / n) * r;
  }
  return { dm, db };
}

/** Ein Schritt Gradientenabstieg mit Lernrate eta. */
export function descend(m: number, b: number, eta: number, data: readonly Pt[] = DATA): { m: number; b: number } {
  const g = gradient(m, b, data);
  return { m: m - eta * g.dm, b: b - eta * g.db };
}

/** Größte Eigenwert der Hesse-Matrix; Lernraten über 2/λmax lassen den Abstieg explodieren. */
export function maxCurvature(data: readonly Pt[] = DATA): number {
  const n = data.length;
  const a = (2 / n) * data.reduce((s, p) => s + p.x * p.x, 0);
  const c = (2 / n) * data.reduce((s, p) => s + p.x, 0);
  const d = 2;
  const tr = a + d;
  const det = a * d - c * c;
  return tr / 2 + Math.sqrt((tr * tr) / 4 - det);
}

/** Lernraten zum Auswählen: zu klein, gut, zu groß. */
export const ETAS = [0.01, 0.12, 0.2] as const;
