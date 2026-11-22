import { describe, expect, it } from 'vitest';
import {
  abs,
  add,
  argDeg,
  c,
  cText,
  conj,
  det,
  div,
  evalPoly,
  exp,
  fromMatrix,
  I,
  matMul,
  mul,
  nthRoots,
  parseC,
  polarDeg,
  polarText,
  powInt,
  powMoivre,
  solveQuadratic,
  sqrtC,
  sub,
  toMatrix,
} from '../src/simulations/mathematik/komplexe-zahlen/model';

const near = (a: { re: number; im: number }, re: number, im: number, d = 10) => {
  expect(a.re).toBeCloseTo(re, d);
  expect(a.im).toBeCloseTo(im, d);
};
const n = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');

describe('Komplexe Zahlen: Lehrbuchwerte', () => {
  it('(1 + i)·(1 − i) = 2', () => near(mul(c(1, 1), c(1, -1)), 2, 0));
  it('(1 + i)² = 2i', () => near(powInt(c(1, 1), 2), 0, 2));
  it('|3 + 4i| = 5, arg ≈ 53,13°', () => {
    expect(abs(c(3, 4))).toBe(5);
    expect(argDeg(c(3, 4))).toBeCloseTo(53.1301, 4);
  });
  it('z² = −4 hat die Lösungen ±2i', () => {
    const r = nthRoots(c(-4), 2);
    near(r[0]!, 0, 2);
    near(r[1]!, 0, -2);
    const q = solveQuadratic(c(0), c(4));
    near(q.disc, -4, 0);
    near(q.roots[0], 0, 2);
    near(q.roots[1], 0, -2);
  });
  it('i² = −1 und i⁴ = 1', () => {
    near(mul(I, I), -1, 0);
    near(powInt(I, 4), 1, 0);
  });
});

describe('Komplexe Zahlen: Rechnen', () => {
  it('Addition, Subtraktion, Konjugation', () => {
    near(add(c(2, 3), c(1, -1)), 3, 2);
    near(sub(c(2, 3), c(1, -1)), 1, 4);
    near(mul(c(3, 4), conj(c(3, 4))), 25, 0);
  });
  it('Division (2 + 3i)/(1 − i) = −0,5 + 2,5i', () => {
    near(div(c(2, 3), c(1, -1)), -0.5, 2.5);
    expect(() => div(c(1), c(0))).toThrow();
  });
  it('Multiplikation: Beträge multiplizieren, Winkel addieren', () => {
    const a = polarDeg(2, 30);
    const b = polarDeg(1.5, 50);
    const p = mul(a, b);
    expect(abs(p)).toBeCloseTo(3, 12);
    expect(argDeg(p)).toBeCloseTo(80, 10);
  });
  it('Moivre stimmt mit wiederholtem Malnehmen überein', () => {
    const z = c(1.2, -0.7);
    for (let k = -3; k <= 6; k++) {
      const a = powInt(z, k);
      const b = powMoivre(z, k);
      near(a, b.re, b.im, 9);
    }
  });
  it('n-te Wurzeln: zⁿ = w für alle Lösungen, regelmäßiges Vieleck', () => {
    const w = c(-8, 8);
    const r = nthRoots(w, 5);
    expect(r).toHaveLength(5);
    for (const z of r) near(powInt(z, 5), -8, 8, 9);
    for (let k = 0; k < 5; k++) expect(abs(sub(r[k]!, r[(k + 1) % 5]!))).toBeCloseTo(abs(sub(r[0]!, r[1]!)), 10);
  });
  it('Einheitswurzeln summieren sich zu 0', () => {
    const s = nthRoots(c(1), 7).reduce((a, z) => add(a, z), c(0));
    near(s, 0, 0);
  });
  it('quadratische Gleichung z² − 2z + 5 = 0 → 1 ± 2i', () => {
    const q = solveQuadratic(c(-2), c(5));
    near(q.roots[0], 1, 2);
    near(q.roots[1], 1, -2);
    for (const z of q.roots) near(evalPoly([c(5), c(-2), c(1)], z), 0, 0);
  });
  it('komplexe Koeffizienten: z² − (3 + i)z + (2 + 2i) = 0 → 2 und 1 + i', () => {
    const q = solveQuadratic(c(-3, -1), c(2, 2));
    const set = q.roots.map((z) => [Math.round(z.re * 1e9) / 1e9, Math.round(z.im * 1e9) / 1e9]).sort();
    expect(set).toEqual([
      [1, 1],
      [2, 0],
    ]);
  });
  it('Euler: e^(iπ) = −1', () => near(exp(c(0, Math.PI)), -1, 0));
  it('Hauptwert der Wurzel', () => {
    near(sqrtC(c(-9)), 0, 3);
    near(sqrtC(c(3, 4)), 2, 1);
  });
});

describe('Komplexe Zahlen: Matrizen', () => {
  it('Matrixprodukt entspricht dem Produkt der Zahlen', () => {
    const a = c(1, 2);
    const b = c(-3, 0.5);
    const m = matMul(toMatrix(a), toMatrix(b));
    near(fromMatrix(m), mul(a, b).re, mul(a, b).im);
    expect(det(toMatrix(c(3, 4)))).toBe(25);
  });
  it('i als Matrix ist die Drehung um 90°, i² = −E', () => {
    const m = matMul(toMatrix(I), toMatrix(I));
    expect(m).toEqual([
      [-1, -0],
      [0, -1],
    ]);
  });
});

describe('Komplexe Zahlen: Lesen und Text', () => {
  it('liest verschiedene Schreibweisen', () => {
    near(parseC('3 + 4i')!, 3, 4);
    near(parseC('−2i')!, 0, -2);
    near(parseC('i')!, 0, 1);
    near(parseC('1,5 − 0,5i')!, 1.5, -0.5);
    near(parseC('4i - 1')!, -1, 4);
    near(parseC('2∠90°')!, 0, 2);
    near(parseC('e^(i·3.14159265358979)')!, -1, 0, 9);
    expect(parseC('')).toBeNull();
    expect(parseC('3 + x')).toBeNull();
    expect(parseC('2ii')).toBeNull();
  });
  it('Text in algebraischer und Polarform', () => {
    expect(cText(c(3, 4), n)).toBe('3 + 4i');
    expect(cText(c(1, -1), n)).toBe('1 − i');
    expect(cText(c(0, -2), n)).toBe('−2i');
    expect(cText(c(-2.5, 0), n)).toBe('−2,5');
    expect(cText(c(0, 1), n)).toBe('i');
    expect(polarText(c(3, 4), n)).toBe('5 · (cos 53,13° + i · sin 53,13°)');
  });
});
