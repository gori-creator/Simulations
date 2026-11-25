import { describe, expect, it } from 'vitest';
import { attractor, koch, kochArea, kochPerimeter, logistic, lotkaVolterra, lvEquilibrium, lvInvariant, period, sierpinski, similarityDimension } from '../src/simulations/mathematik/dynamische-systeme/model';

const P = { a: 1, b: 0.1, c: 1.5, d: 0.075 };

describe('Dynamische Systeme', () => {
  it('bleibt im Gleichgewicht, wenn es dort startet', () => {
    const [xe, ye] = lvEquilibrium(P);
    expect(xe).toBeCloseTo(20);
    expect(ye).toBeCloseTo(10);
    const s = lotkaVolterra(P, xe, ye, 10);
    expect(s.x[s.x.length - 1]).toBeCloseTo(20, 6);
  });

  it('erhält die Erhaltungsgröße längs der Bahn (periodische Schwingung)', () => {
    const s = lotkaVolterra(P, 30, 5, 40, 0.005);
    const V0 = lvInvariant(P, 30, 5);
    for (let i = 0; i < s.x.length; i += 500) expect(lvInvariant(P, s.x[i]!, s.y[i]!)).toBeCloseTo(V0, 4);
  });

  it('zeigt Fixpunkt, Periodenverdopplung und Chaos', () => {
    const fix = attractor(2.5);
    expect(fix[fix.length - 1]).toBeCloseTo(1 - 1 / 2.5, 6);
    expect(period(2.8)).toBe(1);
    expect(period(3.2)).toBe(2);
    expect(period(3.5)).toBe(4);
    expect(period(3.9)).toBe(0);
    expect(logistic(2, 0.5, 3)).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it('baut Fraktale korrekt auf', () => {
    expect(koch(0)).toHaveLength(3);
    expect(koch(2)).toHaveLength(48);
    // Die Spitzen zeigen nach außen: Die Flocke ragt unter die Grundseite des Startdreiecks
    expect(Math.min(...koch(1).map((p) => p[1]))).toBeCloseTo(-Math.sqrt(3) / 6, 9);
    // Fläche des Linienzugs (Schuhbandformel) = Formel
    const shoelace = (pts: [number, number][]) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]!; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    expect(shoelace(koch(3))).toBeCloseTo(kochArea(3), 9);
    expect(kochPerimeter(1)).toBeCloseTo(4);
    expect(kochArea(1)).toBeCloseTo((Math.sqrt(3) / 4) * (4 / 3));
    expect(kochArea(30)).toBeCloseTo((Math.sqrt(3) / 4) * 1.6, 6);
    expect(sierpinski(3)).toHaveLength(27);
    expect(similarityDimension(3, 2)).toBeCloseTo(1.585, 3);
    expect(similarityDimension(4, 3)).toBeCloseTo(1.262, 3);
  });
});
