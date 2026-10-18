import { describe, expect, it } from 'vitest';
import { area, circleIntersections, isSsW, pieces, rayCircleParams, solve, solveSSS, solveSSW, solveSWS, solveWSW, triangleInequality } from '../src/simulations/mathematik/dreieckskonstruktion/model';

describe('Modell: Dreieckskonstruktionen', () => {
  it('SSS: 3-4-5-Dreieck ist rechtwinklig bei C', () => {
    const s = solveSSS(3, 4, 5);
    expect(s.kind).toBe('one');
    if (s.kind !== 'one') return;
    const q = pieces(5, s.c);
    expect(q.a).toBeCloseTo(3, 10);
    expect(q.b).toBeCloseTo(4, 10);
    expect(q.ga).toBeCloseTo(90, 9);
    expect(q.al + q.be + q.ga).toBeCloseTo(180, 9);
    expect(area(5, s.c)).toBeCloseTo(6, 10);
  });
  it('SSS: Dreiecksungleichung (auch Grenzfall a + b = c)', () => {
    expect(triangleInequality(2.5, 3, 7)).toBe(false);
    expect(triangleInequality(3, 4, 7)).toBe(false);
    expect(triangleInequality(3, 4, 6.9)).toBe(true);
    expect(solveSSS(2.5, 3, 7)).toEqual({ kind: 'none', reason: 'triangle' });
    expect(solveSSS(9, 2, 6).kind).toBe('none');
  });
  it('SWS: C liegt im Abstand b auf dem Schenkel von α', () => {
    const s = solveSWS(4, 60);
    if (s.kind !== 'one') throw new Error('erwartet eine Lösung');
    expect(s.c[0]).toBeCloseTo(2, 10);
    expect(s.c[1]).toBeCloseTo(2 * Math.sqrt(3), 10);
    // gleichseitig: b = c = 4, α = 60°
    expect(pieces(4, s.c).a).toBeCloseTo(4, 10);
  });
  it('WSW: Winkel stimmen, Summe ≥ 180° ist unmöglich', () => {
    const s = solveWSW(6, 45, 70);
    if (s.kind !== 'one') throw new Error('erwartet eine Lösung');
    const q = pieces(6, s.c);
    expect(q.al).toBeCloseTo(45, 9);
    expect(q.be).toBeCloseTo(70, 9);
    expect(q.ga).toBeCloseTo(65, 9);
    expect(solveWSW(6, 100, 80).kind).toBe('none');
    expect(solveWSW(6, 120, 70).kind).toBe('none');
  });
  it('SsW: a ≥ c liefert genau ein Dreieck', () => {
    expect(isSsW(6, 5)).toBe(true);
    const s = solveSSW(5, 6, 50);
    expect(s.kind).toBe('one');
    if (s.kind !== 'one') return;
    const q = pieces(5, s.c);
    expect(q.a).toBeCloseTo(6, 9);
    expect(q.al).toBeCloseTo(50, 9);
  });
  it('SSW: a < c kann zwei, eine oder keine Lösung haben', () => {
    const two = solveSSW(7, 4.5, 35);
    expect(two.kind).toBe('two');
    if (two.kind === 'two') {
      expect(pieces(7, two.c).a).toBeCloseTo(4.5, 9);
      expect(pieces(7, two.c2).a).toBeCloseTo(4.5, 9);
      // die beiden Winkel bei C ergänzen sich zu 180°
      expect(pieces(7, two.c).ga + pieces(7, two.c2).ga).toBeCloseTo(180, 9);
    }
    // Berührung: a = c · sin α
    const touch = rayCircleParams(8, 4, 30);
    expect(touch).toHaveLength(1);
    expect(touch[0]).toBeCloseTo(8 * Math.cos(Math.PI / 6), 6);
    expect(solveSSW(7, 3, 35).kind).toBe('none');
    // stumpfer Winkel gegenüber der kleineren Seite: keine Lösung
    expect(solveSSW(7, 4, 120).kind).toBe('none');
  });
  it('WWW: unendlich viele (ähnliche) Dreiecke', () => {
    expect(solve('www', { a: 1, b: 1, c: 4, al: 50, be: 60 }).kind).toBe('many');
    expect(solve('www', { a: 1, b: 1, c: 4, al: 100, be: 90 }).kind).toBe('none');
  });
  it('Kreisschnitt: zwei Punkte, oberer zuerst', () => {
    const s = circleIntersections([0, 0], 5, [6, 0], 5);
    expect(s).toHaveLength(2);
    expect(s[0]![1]).toBeCloseTo(4, 10);
    expect(circleIntersections([0, 0], 1, [6, 0], 1)).toHaveLength(0);
  });
});
