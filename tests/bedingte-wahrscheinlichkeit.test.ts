import { describe, expect, it } from 'vitest';
import {
  apportion,
  assignRoles,
  expectedCounts,
  fourFold,
  joint,
  likelihoodRatio,
  naturalCounts,
  npv,
  ppv,
  ppvAfterTwo,
  ppvFromTable,
  pPositive,
  rng,
  secondSetup,
  setupFromPercent,
} from '../src/simulations/mathematik/bedingte-wahrscheinlichkeit/model';

const BASE = setupFromPercent(1, 90, 91);

describe('Modell: Bedingte Wahrscheinlichkeit (medizinische Tests)', () => {
  it('Prävalenz 1 %, Sensitivität 90 %, Spezifität 91 %: Erwartungswerte für 1000 Personen', () => {
    const e = expectedCounts(BASE);
    expect(e.tp).toBeCloseTo(9, 10);
    expect(e.fn).toBeCloseTo(1, 10);
    expect(e.fp).toBeCloseTo(89.1, 10);
    expect(e.tn).toBeCloseTo(900.9, 10);
  });

  it('… gerundete natürliche Häufigkeiten: 10 krank (9 | 1), 990 gesund (89 | 901)', () => {
    const c = naturalCounts(BASE);
    expect(c).toEqual({ N: 1000, sick: 10, healthy: 990, tp: 9, fn: 1, fp: 89, tn: 901, pos: 98, neg: 902 });
  });

  it('… positiver Vorhersagewert 9 / (9 + 89,1) ≈ 9,2 %, negativer ≈ 99,9 %', () => {
    expect(ppv(BASE)).toBeCloseTo(9 / 98.1, 12);
    expect(Math.round(ppv(BASE) * 1000) / 10).toBe(9.2);
    expect(npv(BASE)).toBeCloseTo(900.9 / 901.9, 12);
    expect(Math.round(npv(BASE) * 1000) / 10).toBe(99.9);
    expect(pPositive(BASE)).toBeCloseTo(0.0981, 12);
  });

  it('Prävalenz 50 %, Sensitivität 90 %, Spezifität 90 % → PPV = 90 %', () => {
    const t = setupFromPercent(50, 90, 90);
    expect(ppv(t)).toBeCloseTo(0.9, 12);
    expect(npv(t)).toBeCloseTo(0.9, 12);
    expect(naturalCounts(t)).toMatchObject({ sick: 500, tp: 450, fn: 50, fp: 50, tn: 450 });
  });

  it('Bayes exakt und Gegenprobe mit der Vierfeldertafel (Zufallswerte), Summe der Felder = 1', () => {
    const r = rng(2024);
    for (let k = 0; k < 500; k++) {
      const t = { prev: 0.001 + r() * 0.499, se: 0.5 + r() * 0.5, sp: 0.5 + r() * 0.5 };
      const bayes = (t.prev * t.se) / (t.prev * t.se + (1 - t.prev) * (1 - t.sp));
      expect(ppv(t)).toBeCloseTo(bayes, 12);
      const c = fourFold(t);
      expect(c[0] + c[1] + c[2] + c[3]).toBeCloseTo(1, 12);
      expect(ppvFromTable(c)).toBeCloseTo(bayes, 12);
      // Randsummen: Zeile „krank“ = Prävalenz, Spalte „positiv“ = P(+)
      expect(c[0] + c[1]).toBeCloseTo(t.prev, 12);
      expect(c[0] + c[2]).toBeCloseTo(pPositive(t), 12);
      // Vorhersagewerte liegen zwischen 0 und 1
      expect(npv(t)).toBeGreaterThan(0);
      expect(npv(t)).toBeLessThanOrEqual(1);
    }
  });

  it('Zweittest: neue Prävalenz = alter Vorhersagewert; nach zwei positiven Tests 100/199 ≈ 50,3 %', () => {
    const s = secondSetup(BASE);
    expect(s.prev).toBeCloseTo(ppv(BASE), 12);
    expect(s.se).toBe(BASE.se);
    expect(s.sp).toBe(BASE.sp);
    const two = ppvAfterTwo(BASE);
    expect(two).toBeCloseTo(ppv({ ...BASE, prev: ppv(BASE) }), 12);
    // Chancen-Form: 1 : 99 · (0,9 / 0,09)² = 100 : 99
    expect(two).toBeCloseTo(100 / 199, 12);
    expect(Math.round(two * 1000) / 10).toBe(50.3);
    expect(likelihoodRatio(BASE)).toBeCloseTo(10, 12);
  });

  it('Restverfahren: Summe der gerundeten Gruppen immer genau 1000', () => {
    expect(apportion(1000, [9, 1, 89.1, 900.9])).toEqual([9, 1, 89, 901]);
    expect(apportion(10, [1, 1, 1])).toEqual([4, 3, 3]);
    expect(apportion(5, [0, 0])).toEqual([0, 0]);
    const r = rng(7);
    for (let k = 0; k < 2000; k++) {
      const t = { prev: 0.001 + r() * 0.499, se: 0.5 + r() * 0.5, sp: 0.5 + r() * 0.5 };
      const c = naturalCounts(t);
      expect(c.tp + c.fn + c.fp + c.tn).toBe(1000);
      expect(c.tp + c.fn).toBe(c.sick);
      expect(c.fp + c.tn).toBe(c.healthy);
      for (const v of [c.tp, c.fn, c.fp, c.tn]) expect(Number.isInteger(v) && v >= 0).toBe(true);
      // gerundet heißt: höchstens 1 Person Abweichung je Stufe
      expect(Math.abs(c.sick - t.prev * 1000)).toBeLessThan(1);
      const w = [3 * r(), r(), 10 * r(), r() * 0.01];
      expect(apportion(1000, w).reduce((s, v) => s + v, 0)).toBe(1000);
    }
  });

  it('Grenzfall Prävalenz 0,1 %: 1 kranke Person, PPV ≈ 1,0 %', () => {
    const t = setupFromPercent(0.1, 90, 91);
    const c = naturalCounts(t);
    expect(c.sick).toBe(1);
    expect(c.tp).toBe(1);
    expect(c.fn).toBe(0);
    expect(c.fp).toBe(90); // 999 · 0,09 = 89,91
    expect(c.tn).toBe(909);
    expect(ppv(t)).toBeCloseTo(0.0009 / (0.0009 + 0.999 * 0.09), 12);
    expect(Math.round(ppv(t) * 1000) / 10).toBe(1);
  });

  it('Grenzfall Spezifität 100 %: keine falsch positiven, PPV = 100 %', () => {
    const t = setupFromPercent(1, 90, 100);
    expect(joint(t).fp).toBe(0);
    expect(naturalCounts(t).fp).toBe(0);
    expect(ppv(t)).toBe(1);
    expect(likelihoodRatio(t)).toBe(Infinity);
    expect(ppvAfterTwo(t)).toBe(1);
  });

  it('Grenzfall Sensitivität 100 %: keine falsch negativen, NPV = 100 %', () => {
    const t = setupFromPercent(5, 100, 80);
    expect(naturalCounts(t).fn).toBe(0);
    expect(npv(t)).toBe(1);
  });

  it('nicht definierter Vorhersagewert ohne positiv Getestete', () => {
    expect(Number.isNaN(ppv({ prev: 0, se: 0.9, sp: 1 }))).toBe(true);
    expect(secondSetup({ prev: 0, se: 0.9, sp: 1 }).prev).toBe(0);
  });

  it('Rollen der Personen passen zu den Anzahlen und bleiben stabil', () => {
    const r = rng(11);
    const u = Array.from({ length: 1000 }, r);
    const v = Array.from({ length: 1000 }, r);
    const c = naturalCounts(BASE);
    const roles = assignRoles(u, v, c);
    const count = (x: string) => roles.filter((q) => q === x).length;
    expect([count('tp'), count('fn'), count('fp'), count('tn')]).toEqual([9, 1, 89, 901]);
    // etwas mehr Kranke: die bisher Kranken bleiben krank
    const roles2 = assignRoles(u, v, naturalCounts(setupFromPercent(2, 90, 91)));
    roles.forEach((q, i) => {
      if (q === 'tp' || q === 'fn') expect(['tp', 'fn']).toContain(roles2[i]);
    });
  });
});
