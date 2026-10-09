import { describe, expect, it } from 'vitest';
import {
  denominatorFactors,
  gcd,
  levelBounds,
  longDivision,
  nextRemainder,
  orderOfTen,
  placeName,
  plainDecimal,
  powerOfTen,
  predict,
  primeFactors,
  remainders,
} from '../src/simulations/mathematik/dezimalbrueche/model';

describe('Modell: Endliche und periodische Dezimalbrüche – schriftliche Division', () => {
  it('rechnet endliche Dezimalbrüche aus', () => {
    expect(plainDecimal(longDivision(3, 8))).toBe('0,375');
    expect(plainDecimal(longDivision(1, 2))).toBe('0,5');
    expect(plainDecimal(longDivision(7, 4))).toBe('1,75');
    expect(plainDecimal(longDivision(1, 20))).toBe('0,05');
    expect(plainDecimal(longDivision(13, 40))).toBe('0,325');
    const e = longDivision(3, 8);
    expect(e.kind).toBe('endlich');
    expect(e.steps.map((s) => [s.value, s.digit, s.product, s.rest])).toEqual([
      [30, 3, 24, 6],
      [60, 7, 56, 4],
      [40, 5, 40, 0],
    ]);
  });

  it('erkennt rein periodische Dezimalbrüche am wiederkehrenden Rest', () => {
    const e = longDivision(3, 7);
    expect(plainDecimal(e)).toBe('0,[428571]');
    expect(e.kind).toBe('rein');
    expect(e.periodLength).toBe(6);
    expect(remainders(e)).toEqual([3, 2, 6, 4, 5, 1, 3]);
    expect(e.repeatOf).toBe(0);
    expect(plainDecimal(longDivision(1, 3))).toBe('0,[3]');
    expect(plainDecimal(longDivision(2, 11))).toBe('0,[18]');
    expect(plainDecimal(longDivision(1, 13))).toBe('0,[076923]');
    expect(plainDecimal(longDivision(2, 13))).toBe('0,[153846]');
    expect(plainDecimal(longDivision(22, 7))).toBe('3,[142857]');
    expect(plainDecimal(longDivision(1, 17))).toBe('0,[0588235294117647]');
  });

  it('erkennt gemischt periodische Dezimalbrüche (Vorperiode)', () => {
    const e = longDivision(1, 6);
    expect(plainDecimal(e)).toBe('0,1[6]');
    expect(e.kind).toBe('gemischt');
    expect(e.preLength).toBe(1);
    expect(e.periodLength).toBe(1);
    expect(remainders(e)).toEqual([1, 4, 4]);
    expect(plainDecimal(longDivision(5, 12))).toBe('0,41[6]');
    expect(plainDecimal(longDivision(7, 30))).toBe('0,2[3]');
    expect(plainDecimal(longDivision(1, 44))).toBe('0,02[27]');
    expect(plainDecimal(longDivision(1, 28))).toBe('0,03[571428]');
    expect(plainDecimal(longDivision(1, 48))).toBe('0,0208[3]');
    expect(plainDecimal(longDivision(3, 14))).toBe('0,2[142857]');
    expect(plainDecimal(longDivision(4, 15))).toBe('0,2[6]');
  });

  it('längste Periode bei Nennern bis 50: 1/47 mit 46 Ziffern', () => {
    expect(longDivision(1, 47).periodLength).toBe(46);
    expect(longDivision(1, 49).periodLength).toBe(42);
    let best = 0;
    for (let n = 2; n <= 50; n++) for (let z = 1; z < n; z++) best = Math.max(best, longDivision(z, n).periodLength);
    expect(best).toBe(46);
  });

  it('ganze Zahlen und ungekürzte Brüche', () => {
    const e = longDivision(12, 4);
    expect(e.kind).toBe('ganz');
    expect(plainDecimal(e)).toBe('3');
    expect(plainDecimal(longDivision(3, 6))).toBe('0,5');
    expect(plainDecimal(longDivision(9, 12))).toBe('0,75');
    expect(plainDecimal(longDivision(6, 9))).toBe('0,[6]');
  });

  it('jede Ziffer ist kleiner als 10, jeder Rest kleiner als der Nenner', () => {
    for (let n = 2; n <= 50; n++) {
      for (let z = 1; z <= 99; z++) {
        const e = longDivision(z, n);
        for (const s of e.steps) {
          expect(s.digit).toBeGreaterThanOrEqual(0);
          expect(s.digit).toBeLessThanOrEqual(9);
          expect(s.rest).toBeLessThan(n);
          expect(s.value).toBe(10 * s.from);
          expect(s.product + s.rest).toBe(s.value);
          expect(nextRemainder(s.from, n)).toBe(s.rest);
        }
        // Periodenlänge höchstens n − 1
        expect(e.periodLength).toBeLessThanOrEqual(n - 1);
      }
    }
  });

  it('der Wert stimmt: z/n = ganzer Teil + Vorperiode + Periode', () => {
    for (let n = 2; n <= 50; n++) {
      for (let z = 1; z <= 60; z++) {
        const e = longDivision(z, n);
        // Periode unendlich oft wiederholt, Vergleich auf 12 Stellen genau
        let s = `${e.integer}.${e.pre}`;
        if (e.period) while (s.length < 30) s += e.period;
        expect(Number(s)).toBeCloseTo(z / n, 12);
      }
    }
  });
});

describe('Modell: Vorhersage über die Primfaktoren des Nenners', () => {
  it('zerlegt in Primfaktoren', () => {
    expect(primeFactors(40)).toEqual([2, 2, 2, 5]);
    expect(primeFactors(49)).toEqual([7, 7]);
    expect(primeFactors(47)).toEqual([47]);
    expect(gcd(12, 18)).toBe(6);
  });

  it('Ordnung von 10 (Periodenlänge bei teilerfremdem Nenner)', () => {
    expect(orderOfTen(3)).toBe(1);
    expect(orderOfTen(7)).toBe(6);
    expect(orderOfTen(11)).toBe(2);
    expect(orderOfTen(13)).toBe(6);
    expect(orderOfTen(17)).toBe(16);
    expect(orderOfTen(21)).toBe(6);
    expect(orderOfTen(41)).toBe(5);
    expect(orderOfTen(47)).toBe(46);
    expect(orderOfTen(1)).toBe(0);
  });

  it('sagt endlich / rein / gemischt periodisch richtig vorher', () => {
    expect(predict(3, 8)).toMatchObject({ kind: 'endlich', a: 3, b: 0, preLength: 3, periodLength: 0 });
    expect(predict(3, 7)).toMatchObject({ kind: 'rein', preLength: 0, periodLength: 6 });
    expect(predict(1, 6)).toMatchObject({ kind: 'gemischt', a: 1, rest: 3, preLength: 1, periodLength: 1 });
    // Kürzen nicht vergessen: 3/6 = 1/2 ist endlich, obwohl 6 den Faktor 3 hat
    expect(predict(3, 6)).toMatchObject({ z: 1, n: 2, kind: 'endlich' });
    expect(predict(21, 7)).toMatchObject({ kind: 'ganz' });
  });

  it('Vorhersage und schriftliche Division stimmen immer überein', () => {
    for (let n = 2; n <= 50; n++) {
      for (let z = 1; z <= 99; z++) {
        const e = longDivision(z, n);
        const p = predict(z, n);
        expect(e.kind).toBe(p.kind);
        expect(e.preLength).toBe(p.preLength);
        expect(e.periodLength).toBe(p.periodLength);
      }
    }
  });

  it('erweitert endliche Dezimalbrüche auf eine Zehnerpotenz', () => {
    expect(powerOfTen(3, 8)).toMatchObject({ factor: 125, numerator: 375, power: 1000, k: 3 });
    expect(powerOfTen(7, 25)).toMatchObject({ factor: 4, numerator: 28, power: 100 });
    expect(powerOfTen(9, 12)).toMatchObject({ z: 3, n: 4, factor: 25, numerator: 75, power: 100 });
    expect(powerOfTen(1, 3)).toBeNull();
    expect(powerOfTen(1, 6)).toBeNull();
  });

  it('markiert beim Kürzen wegfallende Primfaktoren des Nenners', () => {
    expect(denominatorFactors(3, 12)).toEqual([
      { p: 2, cancelled: false },
      { p: 2, cancelled: false },
      { p: 3, cancelled: true },
    ]);
    expect(denominatorFactors(4, 12).filter((f) => f.cancelled).map((f) => f.p)).toEqual([2, 2]);
    expect(denominatorFactors(1, 7)).toEqual([{ p: 7, cancelled: false }]);
  });

  it('beschriftet die Stufen der Zahlenstrahl-Lupe (mit Übertrag)', () => {
    const e = longDivision(3, 7);
    expect(levelBounds(e, 0)).toEqual(['0', '1']);
    expect(levelBounds(e, 1)).toEqual(['0,4', '0,5']);
    expect(levelBounds(e, 2)).toEqual(['0,42', '0,43']);
    expect(levelBounds(longDivision(19, 20), 1)).toEqual(['0,9', '1']);
    expect(levelBounds(longDivision(22, 7), 1)).toEqual(['3,1', '3,2']);
    expect(levelBounds(longDivision(1, 20), 1)).toEqual(['0', '0,1']);
    expect(levelBounds(longDivision(1, 20), 2, '.')).toEqual(['0.05', '0.06']);
  });

  it('benennt die Stellen', () => {
    expect(placeName(1, 'de')).toBe('Zehntel');
    expect(placeName(3, 'de')).toBe('Tausendstel');
    expect(placeName(2, 'en')).toBe('hundredths');
    expect(placeName(9, 'de')).toBeNull();
  });
});
