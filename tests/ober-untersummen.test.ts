import { describe, expect, it } from 'vitest';
import { exactIntegral, extremes, FUNCTIONS, strips, sumOf } from '../src/simulations/mathematik/ober-untersummen/model';

const cubic = FUNCTIONS.cubic;
const sum = (id: keyof typeof FUNCTIONS, a: number, b: number, n: number, kind: Parameters<typeof strips>[4]) =>
  sumOf(strips(FUNCTIONS[id].f, a, b, n, kind, FUNCTIONS[id].critical));

describe('ober-untersummen: exakte Extremwerte im Streifen', () => {
  it('0,5x³ − 2x auf [−2; 3], n = 1: Minimum am Tiefpunkt x = √(4/3)', () => {
    // f(√(4/3)) = 0,5 · (4/3)^1,5 − 2√(4/3) = −(8/3)/√3 ≈ −1,5396; Breite 5
    const tMin = -8 / (3 * Math.sqrt(3));
    expect(cubic.f(Math.sqrt(4 / 3))).toBeCloseTo(tMin, 12);
    expect(sum('cubic', -2, 3, 1, 'lower')).toBeCloseTo(5 * tMin, 10);
    expect(sum('cubic', -2, 3, 1, 'lower')).toBeCloseTo(-7.698, 3);
    // Maximum am rechten Rand: f(3) = 13,5 − 6 = 7,5
    expect(sum('cubic', -2, 3, 1, 'upper')).toBeCloseTo(37.5, 10);
  });

  it('Hochpunkt der kubischen Funktion im Streifen [−2; 0]', () => {
    const { min, max } = extremes(cubic.f, -2, 0, cubic.critical);
    expect(max).toBeCloseTo(8 / (3 * Math.sqrt(3)), 12);
    expect(min).toBe(0);
  });

  it('sin x: Extremstellen π/2 + kπ werden getroffen', () => {
    const { min, max } = extremes(Math.sin, 0, 6.3, FUNCTIONS.sin.critical);
    expect(max).toBe(1);
    expect(min).toBe(-1);
    expect(FUNCTIONS.sin.critical(-7, 7)).toHaveLength(4);
    // Obersumme mit n = 1 auf [0; π]: π · 1
    expect(sum('sin', 0, Math.PI, 1, 'upper')).toBeCloseTo(Math.PI, 12);
  });

  it('x² auf [−1; 1], n = 1: Untersumme 0 (Scheitel innen), Obersumme 2', () => {
    expect(sum('x2', -1, 1, 1, 'lower')).toBe(0);
    expect(sum('x2', -1, 1, 1, 'upper')).toBe(2);
  });

  it('ohne Angabe der Extremstellen: numerische Nachbesserung ist genau', () => {
    const { min } = extremes(cubic.f, -2, 3);
    expect(min).toBeCloseTo(-8 / (3 * Math.sqrt(3)), 9);
  });
});

describe('ober-untersummen: Aufgaben aus dem Lernmaterial', () => {
  it('Aufgabe 1: x² auf [0; 2], n = 4 ⇒ U₄ = 1,75, O₄ = 3,75, Differenz 2', () => {
    expect(sum('x2', 0, 2, 4, 'lower')).toBeCloseTo(1.75, 12);
    expect(sum('x2', 0, 2, 4, 'upper')).toBeCloseTo(3.75, 12);
    expect(exactIntegral(FUNCTIONS.x2, 0, 2)).toBeCloseTo(8 / 3, 12);
  });

  it('Aufgabe 2: O_n − U_n = 8/n, erstmals < 0,1 für n = 81', () => {
    const diff = (n: number) => sum('x2', 0, 2, n, 'upper') - sum('x2', 0, 2, n, 'lower');
    expect(diff(80)).toBeCloseTo(0.1, 12);
    expect(diff(81)).toBeLessThan(0.1);
    expect(diff(128)).toBeCloseTo(0.0625, 12);
  });

  it('Aufgabe 3: ∫ von −2 bis 3 (0,5x³ − 2x) dx = 3,125', () => {
    expect(exactIntegral(cubic, -2, 3)).toBeCloseTo(3.125, 12);
    // vertauschte Grenzen: Vorzeichen wechselt
    expect(exactIntegral(cubic, 3, -2)).toBeCloseTo(-3.125, 12);
  });

  it('Unter- ≤ Integral ≤ Obersumme für alle Funktionen und viele n', () => {
    for (const [id, def] of Object.entries(FUNCTIONS) as [keyof typeof FUNCTIONS, (typeof FUNCTIONS)[keyof typeof FUNCTIONS]][]) {
      const [a, b] = id === 'sqrt' ? [0, 9] : [-2, 3];
      const exact = exactIntegral(def, a, b);
      for (const n of [1, 3, 7, 16, 50]) {
        expect(sum(id, a, b, n, 'lower')).toBeLessThanOrEqual(exact + 1e-12);
        expect(sum(id, a, b, n, 'upper')).toBeGreaterThanOrEqual(exact - 1e-12);
      }
    }
  });
});
