import { describe, expect, it } from 'vitest';
import { angleAt, angleKind, positionToCircle, type Point } from '../src/simulations/mathematik/thales/model';

const A: Point = [-3, 0];
const B: Point = [3, 0];
const onCircle = (deg: number): Point => [3 * Math.cos((deg * Math.PI) / 180), 3 * Math.sin((deg * Math.PI) / 180)];

describe('Satz des Thales – Prüfwerte', () => {
  it('C(0|3) über A(−3|0), B(3|0) ergibt γ = 90°', () => {
    expect(angleAt([0, 3], A, B)).toBeCloseTo(90, 12);
    expect(angleKind([0, 3], A, B)).toBe('right');
  });

  it('C(3·cos 60°|3·sin 60°) ergibt α = 30°, β = 60°, γ = 90°', () => {
    const c = onCircle(60);
    expect(angleAt(A, B, c)).toBeCloseTo(30, 9);
    expect(angleAt(B, A, c)).toBeCloseTo(60, 9);
    expect(angleAt(c, A, B)).toBeCloseTo(90, 9);
  });

  it('Winkel bei A ist halb so groß wie der Lagewinkel φ (Umfangswinkel)', () => {
    for (const phi of [10, 62, 70, 135, 170]) {
      const c = onCircle(phi);
      expect(angleAt(A, B, c)).toBeCloseTo(phi / 2, 9);
      expect(angleAt(A, B, c) + angleAt(B, A, c)).toBeCloseTo(90, 9);
    }
  });

  it('Aufgabe 1: φ = 70° ⇒ α = 35°, β = 55°, ∠AMC = 110°', () => {
    const c = onCircle(70);
    expect(angleAt(A, B, c)).toBeCloseTo(35, 9);
    expect(angleAt(B, A, c)).toBeCloseTo(55, 9);
    expect(angleAt([0, 0], A, c)).toBeCloseTo(110, 9);
  });

  it('Beispiele „C innerhalb“ und „C außerhalb“', () => {
    expect(angleAt([0.8, 1.4], A, B)).toBeGreaterThan(90);
    expect(angleKind([0.8, 1.4], A, B)).toBe('obtuse');
    expect(positionToCircle([0.8, 1.4], [0, 0], 3, 1e-9)).toBe('inside');
    expect(angleAt([-1.2, 3.8], A, B)).toBeLessThan(90);
    expect(angleKind([-1.2, 3.8], A, B)).toBe('acute');
    expect(positionToCircle([-1.2, 3.8], [0, 0], 3, 1e-9)).toBe('outside');
  });
});

describe('Satz des Thales – Sonderfälle', () => {
  it('C = A oder C = B: kein Dreieck', () => {
    expect(angleAt(A, A, B)).toBeNaN();
    expect(angleKind(A, A, B)).toBe('degenerate');
    expect(angleKind(onCircle(0), A, B)).toBe('degenerate');
    expect(angleKind(onCircle(180), A, B)).toBe('degenerate');
  });

  it('C auf der Geraden AB (innen und außen): kein Dreieck', () => {
    expect(angleKind([0.5, 0], A, B)).toBe('degenerate');
    expect(angleKind([4, 0], A, B)).toBe('degenerate');
    expect(angleAt([0.5, 0], A, B)).toBeCloseTo(180, 9);
    expect(angleAt([4, 0], A, B)).toBeCloseTo(0, 9);
  });

  it('auch unterhalb von AB gilt der Satz', () => {
    for (const phi of [200, 270, 300, 359]) expect(angleKind(onCircle(phi), A, B)).toBe('right');
  });

  it('Winkelart passt auf dem 0,1er-Raster immer zur Lage (Umkehrung)', () => {
    for (let i = -50; i <= 50; i++) {
      for (let j = -40; j <= 40; j++) {
        if (j === 0) continue;
        const c: Point = [i / 10, j / 10];
        const gamma = angleAt(c, A, B);
        const kind = angleKind(c, A, B);
        const pos = positionToCircle(c, [0, 0], 3, 1e-9);
        expect(kind).toBe(pos === 'on' ? 'right' : pos === 'inside' ? 'obtuse' : 'acute');
        if (kind === 'right') expect(gamma).toBeCloseTo(90, 9);
        if (kind === 'obtuse') expect(gamma).toBeGreaterThan(90);
        if (kind === 'acute') expect(gamma).toBeLessThan(90);
      }
    }
  });
});
