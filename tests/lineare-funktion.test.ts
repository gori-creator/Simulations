import { describe, expect, it } from 'vitest';
import { isRounded, lineRelation, lineThrough, slopeAngleDeg, zeroOf } from '../src/simulations/mathematik/lineare-funktion/model';
import { Formatter, term } from '../src/sim-core';

describe('Modell: Lineare Funktion f(x) = m·x + t', () => {
  it('berechnet die Nullstelle x₀ = −t : m', () => {
    expect(zeroOf(2, -1)).toBeCloseTo(0.5, 12);
    expect(zeroOf(-0.5, 3)).toBeCloseTo(6, 12);
    expect(zeroOf(0.5, -2)).toBeCloseTo(4, 12);
    // Ursprungsgerade: Nullstelle 0, nicht −0
    expect(Object.is(zeroOf(1, 0), 0)).toBe(true);
  });

  it('behandelt m = 0: keine Nullstelle, bei t = 0 ist jede Stelle Nullstelle', () => {
    expect(zeroOf(0, 2)).toBeNull();
    expect(zeroOf(0, 0)).toBe('all');
  });

  it('liefert Punkte auf der Geraden (m = 2, t = −1 → P(3|5))', () => {
    const f = (x: number) => 2 * x - 1;
    expect(f(3)).toBe(5);
  });

  it('bestimmt die Gerade durch zwei Punkte über m = Δy : Δx', () => {
    expect(lineThrough(1, 2, 4, 8)).toEqual({ m: 2, t: 0 });
    const ab = lineThrough(-2, -1, 2, 5)!;
    expect(ab.m).toBeCloseTo(1.5, 12);
    expect(ab.t).toBeCloseTo(2, 12);
    // Senkrechte Gerade ist keine Funktion
    expect(lineThrough(3, 1, 3, 5)).toBeNull();
  });

  it('erkennt gerundete Werte (Anzeige „≈“ statt „=“)', () => {
    expect(isRounded(-4 / 3, 2)).toBe(true); // x₀ von 1,5x + 2
    expect(isRounded(6, 2)).toBe(false);
    expect(isRounded(0.5, 2)).toBe(false);
    expect(isRounded(slopeAngleDeg(1), 1)).toBe(false); // 45°
    expect(isRounded(slopeAngleDeg(0.5), 1)).toBe(true); // 26,565…°
  });

  it('berechnet den Steigungswinkel', () => {
    expect(slopeAngleDeg(1)).toBeCloseTo(45, 12);
    expect(slopeAngleDeg(-1)).toBeCloseTo(-45, 12);
    expect(slopeAngleDeg(0)).toBe(0);
    expect(slopeAngleDeg(0.5)).toBeCloseTo(26.565, 3);
  });

  it('erkennt Lage zweier Geraden', () => {
    expect(lineRelation(0.5, 1, 0.5, -2).kind).toBe('parallel');
    expect(lineRelation(0.5, 1, 0.5, 1).kind).toBe('identical');
    const perp = lineRelation(2, -1, -0.5, 2);
    expect(perp.kind).toBe('intersect');
    if (perp.kind !== 'intersect') return;
    expect(perp.perpendicular).toBe(true);
    expect(perp.x).toBeCloseTo(1.2, 12);
    expect(perp.y).toBeCloseTo(1.4, 12);
    // Handytarife: 2x + 5 = x + 8 → S(3|11)
    const tarif = lineRelation(2, 5, 1, 8);
    if (tarif.kind !== 'intersect') throw new Error('Schnittpunkt erwartet');
    expect(tarif.x).toBeCloseTo(3, 12);
    expect(tarif.y).toBeCloseTo(11, 12);
    expect(tarif.perpendicular).toBe(false);
  });
});

describe('Anzeige: Funktionsterm ohne „+ −“, „1x“ oder „+ 0“', () => {
  const fmt = new Formatter('de');
  const show = (m: number, t: number) =>
    term.sum([{ coef: m, body: 'x' }, { coef: t, body: '' }], fmt);

  it('schreibt negative Werte mit echtem Minus und Dezimalkomma', () => {
    expect(show(-0.5, 3)).toBe('−0,5x + 3');
    expect(show(2, -1)).toBe('2x − 1');
  });

  it('lässt Koeffizient 1 und Summand 0 weg', () => {
    expect(show(1, 0)).toBe('x');
    expect(show(-1, 2)).toBe('−x + 2');
    expect(show(0, 2)).toBe('2');
    expect(show(0, 0)).toBe('0');
  });
});
