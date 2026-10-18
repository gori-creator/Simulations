import { describe, expect, it } from 'vitest';
import { angleDeg, cross, crossTerms, dot, handedness, norm, orthogonal, parallelogramArea, projection, projLength, pyramidVolume, spatVolume, triangleArea, triple } from '../src/simulations/mathematik/skalar-vektorprodukt/model';

describe('Modell: Skalarprodukt', () => {
  it('a · b = a₁b₁ + a₂b₂ + a₃b₃', () => {
    expect(dot([1, 2, 0], [0, 1, 2])).toBe(2);
    expect(dot([1, 2, 3], [4, -5, 6])).toBe(12);
  });
  it('Winkel aus cos φ = a·b / (|a|·|b|)', () => {
    expect(angleDeg([1, 0, 0], [0, 1, 0])).toBeCloseTo(90, 12);
    expect(angleDeg([1, 0, 0], [1, 1, 0])).toBeCloseTo(45, 12);
    expect(angleDeg([1, 2, 0], [0, 1, 2])).toBeCloseTo((Math.acos(0.4) * 180) / Math.PI, 10);
    expect(angleDeg([1, 2, 0], [-2, -1, 2])).toBeGreaterThan(90);
    expect(angleDeg([1, 0, 0], [-3, 0, 0])).toBeCloseTo(180, 12);
    expect(Number.isNaN(angleDeg([0, 0, 0], [1, 0, 0]))).toBe(true);
  });
  it('senkrecht genau bei a · b = 0', () => {
    expect(orthogonal([1, 2, 0], [-2, 1, 2])).toBe(true);
    expect(orthogonal([1, 2, 0], [0, 1, 2])).toBe(false);
  });
  it('Projektion von b auf a', () => {
    expect(projection([3, 4, 0], [1, 0, 0])).toEqual([3, 0, 0]);
    expect(projLength([0, 1, 2], [1, 2, 0])).toBeCloseTo(2 / Math.sqrt(5), 12);
    expect(projLength([-2, -1, 2], [1, 2, 0])).toBeLessThan(0);
    // b − Projektion steht senkrecht auf a
    const a = [1, 2, 0] as const;
    const b = [0, 1, 2] as const;
    const f = projection(b, a);
    expect(dot([b[0] - f[0], b[1] - f[1], b[2] - f[2]], a)).toBeCloseTo(0, 12);
  });
});

describe('Modell: Vektorprodukt und Spatprodukt', () => {
  it('a × b über Kreuz', () => {
    expect(cross([1, 2, 0], [0, 1, 2])).toEqual([4, -2, 1]);
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(crossTerms([1, 2, 0], [0, 1, 2])).toEqual([
      [4, 0],
      [0, 2],
      [1, 0],
    ]);
  });
  it('a × b steht senkrecht auf a und b, b × a = −(a × b)', () => {
    const a = [2, -1, 3] as const;
    const b = [0.5, 4, -2] as const;
    const n = cross(a, b);
    expect(dot(n, a)).toBeCloseTo(0, 12);
    expect(dot(n, b)).toBeCloseTo(0, 12);
    expect(cross(b, a)).toEqual(n.map((v) => -v));
  });
  it('|a × b| = |a|·|b|·sin φ = Parallelogrammfläche', () => {
    const a = [1, 2, 0] as const;
    const b = [0, 1, 2] as const;
    const phi = (angleDeg(a, b) * Math.PI) / 180;
    expect(parallelogramArea(a, b)).toBeCloseTo(norm(a) * norm(b) * Math.sin(phi), 12);
    expect(parallelogramArea([0, 3, 0], [0, 0, 2])).toBe(6);
    expect(triangleArea([0, 3, 0], [0, 0, 2])).toBe(3);
    expect(parallelogramArea([1, 2, 3], [2, 4, 6])).toBe(0);
  });
  it('Spatprodukt: Volumen von Spat und Pyramide', () => {
    expect(triple([1, 2, 0], [0, 1, 2], [1, -1, 2])).toBe(8);
    expect(spatVolume([1, 0, 0], [0, 2, 0], [0, 0, 3])).toBe(6);
    expect(pyramidVolume([1, 0, 0], [0, 2, 0], [0, 0, 3])).toBe(1);
    expect(handedness([1, 0, 0], [0, 1, 0], [0, 0, 1])).toBe('right');
    expect(handedness([0, 1, 0], [1, 0, 0], [0, 0, 1])).toBe('left');
    expect(handedness([1, 0, 0], [0, 1, 0], [1, 1, 0])).toBe('flat');
  });
});
