import { describe, expect, it } from 'vitest';
import {
  approxText,
  compareTariffs,
  crossesAtNegativeTime,
  frac,
  fracText,
  fromGeneral,
  fromNormal,
  fromTariff,
  generalText,
  niceMax,
  normalOf,
  normalText,
  pointText,
  satisfies,
  solve,
  yAt,
} from '../src/simulations/mathematik/lgs-grafisch/model';

describe('LGS grafisch: Lösen', () => {
  it('findet den Schnittpunkt exakt', () => {
    const s = solve(fromNormal(2, -1), fromNormal(-1, 5));
    expect(s).toEqual({ kind: 'unique', x: frac(2), y: frac(3) });
    const g = solve(fromGeneral(2, 1, 5), fromGeneral(1, -1, 1));
    expect(g).toEqual({ kind: 'unique', x: frac(2), y: frac(1) });
    const f = solve(fromNormal(1, 0), fromNormal(-0.5, 2));
    expect(f).toEqual({ kind: 'unique', x: frac(4, 3), y: frac(4, 3) });
  });

  it('unterscheidet parallele und identische Geraden', () => {
    expect(solve(fromNormal(0.5, 1), fromNormal(0.5, -2)).kind).toBe('parallel');
    expect(solve(fromGeneral(2, -1, 1), fromGeneral(-4, 2, -2)).kind).toBe('identical');
    expect(solve(fromGeneral(2, -1, 1), fromGeneral(-4, 2, 3)).kind).toBe('parallel');
    expect(solve(fromGeneral(0, 0, 3), fromGeneral(1, 1, 1)).kind).toBe('invalid');
    // Senkrechte und waagerechte Gerade
    expect(solve(fromGeneral(1, 0, 3), fromGeneral(0, 2, -4))).toEqual({ kind: 'unique', x: frac(3), y: frac(-2) });
  });

  it('prüft Lösungen durch Einsetzen', () => {
    const l = fromGeneral(2, 1, 5);
    expect(satisfies(l, frac(2), frac(1))).toBe(true);
    expect(satisfies(l, frac(1), frac(1))).toBe(false);
    expect(satisfies(fromNormal(1, 0), frac(4, 3), frac(4, 3))).toBe(true);
    expect(yAt(fromNormal(2, -1), 3)).toBe(5);
    expect(Number.isNaN(yAt(fromGeneral(1, 0, 2), 0))).toBe(true);
  });
});

describe('LGS grafisch: Darstellung', () => {
  it('schreibt Geraden in Normalform und allgemeiner Form', () => {
    expect(normalText(fromNormal(2, -1), 'de')).toBe('y = 2x − 1');
    expect(normalText(fromNormal(-1, 0), 'de')).toBe('y = −x');
    expect(normalText(fromNormal(0, 3), 'de')).toBe('y = 3');
    expect(normalText(fromNormal(0.25, -1.5), 'de')).toBe('y = 0,25x − 1,5');
    expect(normalText(fromGeneral(2, -3, -3), 'de')).toBe('y = 2/3 x + 1');
    expect(normalText(fromGeneral(1, 0, 2), 'de')).toBe('x = 2');
    expect(generalText(fromGeneral(2, 1, 5), 'de')).toBe('2x + y = 5');
    expect(generalText(fromGeneral(1, -1, 1), 'de')).toBe('x − y = 1');
    expect(generalText(fromGeneral(0, 3, -6), 'de')).toBe('3y = −6');
    expect(normalOf(fromGeneral(2, 1, 5))).toEqual({ kind: 'normal', m: frac(-2), t: frac(5) });
  });

  it('formatiert Zahlen und Punkte', () => {
    expect(fracText(frac(3, 2), 'de')).toBe('1,5');
    expect(fracText(frac(-4, 3), 'de')).toBe('−4/3');
    expect(approxText(frac(4, 3), 'de')).toBe('1,3');
    expect(pointText(frac(2), frac(3), 'de')).toBe('(2 | 3)');
    expect(pointText(frac(1, 2), frac(3), 'en')).toBe('(0.5, 3)');
    expect(niceMax(130)).toBe(150);
    expect(niceMax(17)).toBe(20);
  });
});

describe('LGS grafisch: Tarifvergleich', () => {
  it('bestimmt, ab wann sich ein Tarif lohnt', () => {
    const c = compareTariffs(10, 5, 4, 11);
    expect(c).toEqual({ kind: 'cross', minutes: 100, cost: 15, cheaperBelow: 2 });
    expect(solve(fromTariff(10, 5), fromTariff(4, 11))).toEqual({ kind: 'unique', x: frac(100), y: frac(15) });
    expect(compareTariffs(10, 5, 12, 5)).toEqual({ kind: 'always', cheaper: 1 });
    expect(compareTariffs(4, 5, 10, 11)).toEqual({ kind: 'always', cheaper: 1 });
    expect(compareTariffs(4, 5, 4, 5)).toEqual({ kind: 'same' });
  });
});

describe('LGS grafisch: Sonderfälle (Prüfrunde)', () => {
  it('rechnet Aufgaben aus dem Lernmaterial nach', () => {
    // Aufgabe 1: y = x + 1, y = −2x + 7 → (2 | 3)
    expect(solve(fromNormal(1, 1), fromNormal(-2, 7))).toEqual({ kind: 'unique', x: frac(2), y: frac(3) });
    // Aufgabe 2: x + y = 6, 2x − y = 3 → (3 | 3)
    expect(solve(fromGeneral(1, 1, 6), fromGeneral(2, -1, 3))).toEqual({ kind: 'unique', x: frac(3), y: frac(3) });
    // Aufgabe 3 (b): 2x + 4y = 8 und x + 2y = 4 sind identisch
    expect(solve(fromGeneral(2, 4, 8), fromGeneral(1, 2, 4)).kind).toBe('identical');
    // Aufgabe 5 mit 9 ct: Grenze bei 150 min und 17,50 €
    expect(compareTariffs(10, 5, 4, 9)).toEqual({ kind: 'cross', minutes: 150, cost: 17.5, cheaperBelow: 2 });
    // Aufgabe 6: x + y = 10, x − y = 4 → (7 | 3)
    expect(solve(fromGeneral(1, 1, 10), fromGeneral(1, -1, 4))).toEqual({ kind: 'unique', x: frac(7), y: frac(3) });
  });

  it('behandelt Grenzfälle beim Tarifvergleich', () => {
    // Gleiche Grundgebühr: gleich teuer bei 0 min, danach ist der kleinere Minutenpreis günstiger
    expect(compareTariffs(5, 3, 5, 8)).toEqual({ kind: 'always', cheaper: 1 });
    // Schnittpunkt bei negativer Zeit: im Sachkontext kein Wechsel
    expect(compareTariffs(4, 5, 10, 11).kind).toBe('always');
    // Gleiche Tarife ergeben identische Geraden
    expect(solve(fromTariff(10, 5), fromTariff(10, 5)).kind).toBe('identical');
    // Schnitt bei −100 min (A 4 € + 5 ct, B 10 € + 11 ct): Hinweis im Sachzusammenhang
    expect(crossesAtNegativeTime(4, 5, 10, 11)).toBe(true);
    expect(solve(fromTariff(4, 5), fromTariff(10, 11))).toEqual({ kind: 'unique', x: frac(-100), y: frac(-1) });
    expect(crossesAtNegativeTime(10, 5, 4, 11)).toBe(false); // Schnitt bei +100 min
    expect(crossesAtNegativeTime(5, 3, 5, 8)).toBe(false); // Schnitt genau bei 0 min
    expect(crossesAtNegativeTime(10, 5, 12, 5)).toBe(false); // parallel
    // Minutenpreis 0: waagerechte Gerade
    expect(normalText(fromTariff(12, 0), 'de')).toBe('y = 12');
  });

  it('schreibt Brüche, negative Werte und senkrechte Geraden richtig', () => {
    expect(normalText(fromGeneral(-2, 3, 3), 'de')).toBe('y = 2/3 x + 1');
    expect(normalText(fromGeneral(1, 3, -1), 'en')).toBe('y = −1/3 x − 1/3');
    expect(pointText(frac(-3, 2), frac(-1, 4), 'de')).toBe('(−1,5 | −0,25)');
    expect(approxText(frac(-4, 3), 'de')).toBe('−1,3');
    expect(approxText(frac(2, 3), 'en')).toBe('0.7');
    expect(generalText(fromGeneral(-1, 0, 0), 'de')).toBe('−x = 0');
    expect(solve(fromGeneral(1, 0, 3), fromGeneral(2, 0, -4)).kind).toBe('parallel');
    expect(solve(fromGeneral(1, 0, 3), fromGeneral(-2, 0, -6)).kind).toBe('identical');
  });
});
