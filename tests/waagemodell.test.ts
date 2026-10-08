import { describe, expect, it } from 'vitest';
import {
  canDivide,
  divide,
  equationText,
  fracText,
  isSolved,
  mergeable,
  modelFit,
  noVariableLeft,
  opText,
  packageWeight,
  pans,
  randomEquation,
  samePans,
  solve,
  stepBetween,
  subtract,
  suggestedDivisor,
  tiltTarget,
  weight,
} from '../src/simulations/mathematik/waagemodell/model';
import { seededRandom } from '../src/sim-core/anim';

describe('Waagemodell: Lösen', () => {
  it('löst a·x + b = c·x + d', () => {
    expect(solve(pans(3, 2, 1, 8))).toEqual({ kind: 'unique', x: { num: 3, den: 1 } });
    expect(solve(pans(2, 0, 0, 3))).toEqual({ kind: 'unique', x: { num: 3, den: 2 } });
    expect(solve(pans(1, 9, 3, 13))).toEqual({ kind: 'unique', x: { num: -2, den: 1 } });
    expect(solve(pans(2, 3, 2, 5))).toEqual({ kind: 'none' });
    expect(solve(pans(1, 4, 1, 4))).toEqual({ kind: 'all' });
  });

  it('erkennt die Grenzen des Modells', () => {
    expect(modelFit(pans(3, 2, 1, 8))).toBe('ok');
    expect(modelFit(pans(1, 9, 3, 13))).toBe('negative');
    expect(modelFit(pans(2, 3, 1, 3))).toBe('zero');
    expect(modelFit(pans(2, 3, 2, 5))).toBe('none');
    expect(modelFit(pans(1, 4, 1, 4))).toBe('all');
  });

  it('zeigt das Gleichgewicht physikalisch richtig an', () => {
    const start = pans(3, 2, 1, 8);
    const w = packageWeight(start);
    expect(w).toBe(3);
    expect(weight(start.left, w)).toBe(11);
    expect(tiltTarget(start, w)).toBe(0);
    // Nur links ein Gewichtsstück weg: links leichter → rechts unten (negativer Winkel)
    expect(tiltTarget(pans(3, 1, 1, 8), w)).toBeLessThan(0);
    expect(Math.abs(tiltTarget(pans(6, 0, 0, 0), w))).toBeLessThanOrEqual(13);
    // Negative Lösung: Die Waage kippt für jedes positive Gewicht zur selben Seite
    const neg = pans(1, 9, 3, 13);
    expect(packageWeight(neg)).toBe(1);
    expect(tiltTarget(neg, 1)).toBeLessThan(0);
    expect(tiltTarget(neg, 5)).toBeLessThan(0);
  });
});

describe('Waagemodell: Äquivalenzumformungen', () => {
  it('nimmt auf beiden Seiten weg und teilt', () => {
    let p = pans(3, 2, 1, 8);
    p = subtract(p, 1, 0);
    expect(equationText(p)).toBe('2x + 2 = 8');
    p = subtract(p, 0, 2);
    expect(equationText(p)).toBe('2x = 6');
    expect(suggestedDivisor(p)).toBe(2);
    expect(canDivide(p, 2)).toBe(true);
    p = divide(p, 2);
    expect(equationText(p)).toBe('x = 3');
    expect(isSolved(p)).toBe(true);
  });

  it('schlägt sinnvolle Teiler vor', () => {
    expect(suggestedDivisor(pans(4, 2, 2, 6))).toBe(2);
    expect(suggestedDivisor(pans(3, 0, 0, 9))).toBe(3);
    expect(suggestedDivisor(pans(0, 12, 4, 0))).toBe(4);
    expect(suggestedDivisor(pans(4, 0, 0, 6))).toBe(2);
    expect(suggestedDivisor(pans(2, 0, 0, 3))).toBeNull();
    expect(canDivide(pans(2, 0, 0, 3), 2)).toBe(false);
  });

  it('erkennt einseitige Änderungen und gleiche Schritte auf beiden Seiten', () => {
    const before = pans(3, 2, 1, 8);
    expect(stepBetween(before, pans(2, 2, 0, 8))).toEqual({ kind: 'sub', x: 1, c: 0 });
    expect(stepBetween(before, pans(2, 1, 0, 7))).toEqual({ kind: 'sub', x: 1, c: 1 });
    expect(stepBetween(before, pans(2, 2, 1, 8))).toBeNull();
    // Links x, rechts 3 weg: zufällig im Gleichgewicht, aber keine Umformung
    expect(stepBetween(before, pans(2, 2, 1, 5))).toBeNull();
    expect(stepBetween(before, before)).toBeNull();
  });

  it('beschreibt Umformungen wie im Heft', () => {
    expect(opText({ kind: 'sub', x: 1, c: 0 })).toBe('− x');
    expect(opText({ kind: 'sub', x: 2, c: 0 })).toBe('− 2x');
    expect(opText({ kind: 'sub', x: 0, c: 3 })).toBe('− 3');
    expect(opText({ kind: 'sub', x: 1, c: 2 })).toBe('− (x + 2)');
    expect(opText({ kind: 'div', n: 2 })).toBe(': 2');
    expect(mergeable({ kind: 'sub', x: 0, c: 1 }, { kind: 'sub', x: 0, c: 1 })).toBe(true);
    expect(mergeable({ kind: 'sub', x: 1, c: 0 }, { kind: 'sub', x: 0, c: 1 })).toBe(false);
    expect(mergeable({ kind: 'div', n: 2 }, { kind: 'div', n: 2 })).toBe(false);
    expect(equationText(pans(0, 5, 0, 5))).toBe('5 = 5');
    expect(noVariableLeft(pans(0, 5, 0, 5))).toBe(true);
    expect(fracText({ num: 3, den: 2 }, 'de')).toBe('3/2 = 1,5');
    expect(fracText({ num: -2, den: 1 }, 'de')).toBe('−2');
    expect(samePans(pans(1, 2, 3, 4), pans(1, 2, 3, 4))).toBe(true);
  });

  it('erzeugt lösbare Zufallsaufgaben mit natürlicher Lösung', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const { a, b, c, d } = randomEquation(random);
      const s = solve(pans(a, b, c, d));
      expect(s.kind).toBe('unique');
      if (s.kind !== 'unique') continue;
      expect(s.x.den).toBe(1);
      expect(s.x.num).toBeGreaterThanOrEqual(1);
      expect(s.x.num).toBeLessThanOrEqual(6);
      for (const v of [a, c]) expect(v).toBeLessThanOrEqual(6);
      for (const v of [b, d]) expect(v).toBeLessThanOrEqual(15);
      expect(isSolved(pans(a, b, c, d))).toBe(false);
    }
  });
});
