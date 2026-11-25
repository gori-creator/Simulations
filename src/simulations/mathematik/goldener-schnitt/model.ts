/**
 * Goldener Schnitt: Teilverhältnis, klassische Konstruktion, goldenes
 * Rechteck mit Quadraten und Spirale sowie Fibonacci-Quotienten.
 */

export type Pt = [number, number];
export const PHI = (1 + Math.sqrt(5)) / 2;

/** Teilung einer Strecke der Länge L am Anteil t: Majorante a, Minorante b und die beiden Verhältnisse. */
export function division(L: number, t: number): { a: number; b: number; ab: number; whole: number } {
  const x = L * t;
  const a = Math.max(x, L - x);
  const b = Math.min(x, L - x);
  return { a, b, ab: a / b, whole: L / a };
}

/** Konstruktion (äußere Teilung über rechtwinkliges Dreieck) für AB = L. */
export function construction(L: number): { A: Pt; B: Pt; C: Pt; D: Pt; T: Pt } {
  const A: Pt = [0, 0];
  const B: Pt = [L, 0];
  const C: Pt = [L, L / 2];
  const AC = Math.hypot(L, L / 2);
  const AD = AC - L / 2;
  const D: Pt = [(L * AD) / AC, (L / 2) * (AD / AC)];
  const T: Pt = [AD, 0];
  return { A, B, C, D, T };
}

export function fibonacci(n: number): number[] {
  const f = [1, 1];
  while (f.length < n) f.push(f[f.length - 1]! + f[f.length - 2]!);
  return f.slice(0, n);
}

export interface Square {
  x: number;
  y: number;
  s: number;
  /** Viertelkreis der Spirale: Mittelpunkt und Winkelbereich */
  cx: number;
  cy: number;
  from: number;
  to: number;
}

/** Quadrate eines goldenen Rechtecks [0, φ] × [0, 1], die nacheinander abgeschnitten werden. */
export function goldenSquares(depth: number): Square[] {
  let x = 0;
  let y = 0;
  let w = PHI;
  let h = 1;
  const out: Square[] = [];
  const P = Math.PI;
  for (let k = 0; k < depth; k++) {
    const m = k % 4;
    if (m === 0) {
      const s = h;
      out.push({ x, y, s, cx: x + s, cy: y, from: P / 2, to: P });
      x += s;
      w -= s;
    } else if (m === 1) {
      const s = w;
      out.push({ x, y: y + h - s, s, cx: x, cy: y + h - s, from: 0, to: P / 2 });
      h -= s;
    } else if (m === 2) {
      const s = h;
      out.push({ x: x + w - s, y, s, cx: x + w - s, cy: y + s, from: -P / 2, to: 0 });
      w -= s;
    } else {
      const s = w;
      out.push({ x, y, s, cx: x + s, cy: y + s, from: -P, to: -P / 2 });
      y += s;
      h -= s;
    }
  }
  return out;
}
