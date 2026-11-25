import { describe, expect, it } from 'vitest';
import { indexFor, limit, partialSum, seriesSum, term } from '../src/simulations/mathematik/folgen-reihen/model';

describe('Folgen', () => {
  it('arithmetisch und geometrisch', () => {
    expect(term('arith', 5, 2, 3, 0)).toBe(14);
    expect(term('geom', 4, 3, 0, 2)).toBe(24);
  });

  it('Grenzwerte', () => {
    expect(limit('inv', 0, 0, 0)).toBe(0);
    expect(limit('ratio', 0, 0, 0)).toBe(1);
    expect(limit('geom', 5, 0, 0.5)).toBe(0);
    expect(limit('geom', 5, 0, 2)).toBeNull();
    expect(limit('alt', 0, 0, 0)).toBeNull();
    expect(term('euler', 100000, 0, 0, 0)).toBeCloseTo(Math.E, 4);
  });

  it('ε-Umgebung: 1/n < 0,01 ab n = 101', () => {
    expect(indexFor(0.01, 0, (n) => 1 / n)).toBe(101);
  });
});

describe('Reihen', () => {
  it('arithmetische Teilsumme (Gauß): 1 + … + 100 = 5050', () => {
    expect(partialSum('arith', 100, 1, 1, 0)).toBe(5050);
  });

  it('geometrische Reihe 1 + 1/2 + 1/4 + … = 2', () => {
    expect(seriesSum('geom', 1, 0, 0.5)).toBe(2);
    expect(partialSum('geom', 10, 1, 0, 0.5)).toBeCloseTo(2 - 1 / 512, 12);
  });

  it('harmonische Reihe wächst über alle Grenzen, aber langsam', () => {
    expect(partialSum('harm', 4, 0, 0, 0)).toBeCloseTo(25 / 12, 12);
    expect(partialSum('harm', 1000, 0, 0, 0)).toBeGreaterThan(7);
    expect(seriesSum('harm', 0, 0, 0)).toBeNull();
  });
});
