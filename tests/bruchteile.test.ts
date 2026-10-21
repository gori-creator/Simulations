import { describe, expect, it } from 'vitest';
import { decimalExpansion, gcd, mixed, reduce } from '../src/simulations/mathematik/bruchteile/model';

/** Dezimaldarstellung als Text (Periode in Klammern), nur für die Tests. */
const dec = (z: number, n: number) => {
  const d = decimalExpansion(z, n);
  return `${d.integer}${d.pre || d.period ? ',' : ''}${d.pre}${d.period ? `(${d.period})` : ''}`;
};

describe('Bruchteile: Prüfwerte', () => {
  it('3/4 = 0,75 = 75 %', () => {
    expect(dec(3, 4)).toBe('0,75');
    expect((3 / 4) * 100).toBe(75);
    expect(reduce(3, 4)).toEqual({ z: 3, n: 4 });
  });

  it('5/8 = 0,625 (Aufgabe 1)', () => {
    expect(dec(5, 8)).toBe('0,625');
    expect((5 / 8) * 100).toBe(62.5);
  });

  it('periodische Dezimalbrüche: 1/3, 1/6, 5/6, 1/12', () => {
    expect(dec(1, 3)).toBe('0,(3)');
    expect(dec(1, 6)).toBe('0,1(6)');
    expect(dec(5, 6)).toBe('0,8(3)');
    expect(dec(1, 12)).toBe('0,08(3)');
    expect(dec(1, 7)).toBe('0,(142857)');
  });

  it('Erweitern ändert den Wert nicht: 2/3 = 8/12, kürzen 6/8 = 3/4', () => {
    expect(reduce(8, 12)).toEqual({ z: 2, n: 3 });
    expect(reduce(6, 8)).toEqual({ z: 3, n: 4 });
    expect(dec(8, 12)).toBe(dec(2, 3));
  });

  it('unechte Brüche als gemischte Zahl: 7/4 = 1 3/4 = 1,75', () => {
    expect(mixed(7, 4)).toEqual({ whole: 1, rest: 3 });
    expect(dec(7, 4)).toBe('1,75');
  });
});

describe('Bruchteile: Sonderfälle', () => {
  it('Zähler 0: 0/4 = 0', () => {
    expect(dec(0, 4)).toBe('0');
    expect(reduce(0, 4)).toEqual({ z: 0, n: 1 });
    expect(mixed(0, 4)).toEqual({ whole: 0, rest: 0 });
  });

  it('Zähler = Nenner: 4/4 = 1', () => {
    expect(dec(4, 4)).toBe('1');
    expect(reduce(4, 4)).toEqual({ z: 1, n: 1 });
    expect(mixed(4, 4)).toEqual({ whole: 1, rest: 0 });
  });

  it('Nenner 1: 3/1 = 3, nicht kürzbar', () => {
    expect(dec(3, 1)).toBe('3');
    expect(reduce(3, 1)).toEqual({ z: 3, n: 1 });
  });

  it('Vielfache des Nenners ergeben ganze Zahlen ohne Rest: 8/4 = 2', () => {
    expect(mixed(8, 4)).toEqual({ whole: 2, rest: 0 });
    expect(dec(8, 4)).toBe('2');
  });

  it('ggT liefert nie 0 (kein Teilen durch 0 beim Kürzen)', () => {
    expect(gcd(0, 0)).toBe(1);
    expect(gcd(12, 18)).toBe(6);
  });

  it('Reglerbereich (n bis 12, z bis 36): Periode immer gefunden, Ziffern bestätigen den Wert', () => {
    for (let n = 1; n <= 12; n++)
      for (let z = 0; z <= 36; z++) {
        const d = decimalExpansion(z, n);
        expect(d.integer).toBe(Math.floor(z / n));
        const approx = Number(`${d.integer}.${d.pre}${d.period.repeat(12)}`);
        expect(approx).toBeCloseTo(z / n, 6);
      }
  });
});
