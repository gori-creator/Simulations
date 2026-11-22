import { describe, expect, it } from 'vitest';
import { classify, DATASETS, doublingTime, fit, inflection, rate, recursive, sse, table, timeTo, value, type Params } from '../src/simulations/mathematik/wachstumsmodelle/model';

const P = (o: Partial<Params>): Params => ({ B0: 10, d: 5, k: 0.5, S: 100, ...o });

describe('Wachstumsmodelle: Lehrbuchwerte', () => {
  it('logistisch S = 100, B(0) = 10, k = 0,5: B(t) = 100/(1 + 9·e^(−0,5t))', () => {
    const p = P({});
    expect(value('logistic', p, 0)).toBeCloseTo(10, 12);
    for (const t of [1, 3, 7.5]) expect(value('logistic', p, t)).toBeCloseTo(100 / (1 + 9 * Math.exp(-0.5 * t)), 12);
  });
  it('Wendepunkt bei B = 50, t = 2·ln 9 ≈ 4,394', () => {
    const w = inflection(P({}))!;
    expect(w.t).toBeCloseTo(2 * Math.log(9), 12);
    expect(w.t).toBeCloseTo(4.394, 3);
    expect(w.B).toBe(50);
    expect(value('logistic', P({}), w.t)).toBeCloseTo(50, 10);
    // größte Änderungsrate k·S/4 = 12,5
    expect(w.rate).toBeCloseTo(12.5, 12);
    expect(rate('logistic', P({}), 50)).toBeCloseTo(12.5, 12);
  });
  it('exponentiell: Verdopplungszeit ln 2 / k', () => {
    const p = P({ k: Math.log(2) / 3 });
    expect(doublingTime(p.k)).toBeCloseTo(3, 12);
    expect(value('exp', p, 3)).toBeCloseTo(20, 10);
    expect(timeTo('exp', p, 40)).toBeCloseTo(6, 10);
  });
  it('beschränkt: Tee 90 °C, Raum 20 °C, k = 0,1 → nach 10 ln 2 min 55 °C', () => {
    const p = P({ B0: 90, S: 20, k: 0.1 });
    expect(value('bounded', p, 10 * Math.log(2))).toBeCloseTo(55, 10);
    expect(timeTo('bounded', p, 55)).toBeCloseTo(10 * Math.log(2), 10);
  });
});

describe('Wachstumsmodelle: rekursiv und Tabellen', () => {
  it('rekursiv = explizit an ganzen Stellen (linear, exponentiell, beschränkt)', () => {
    for (const kind of ['linear', 'exp', 'bounded'] as const) {
      const p = P({ B0: 12, k: 0.3, S: 80 });
      const r = recursive(kind, p, 10);
      r.forEach((B, n) => expect(B).toBeCloseTo(value(kind, p, n), 9));
    }
  });
  it('diskret logistisch nähert stetig bei kleinem k, schwingt bei großem', () => {
    const r = recursive('logistic', P({ k: 2.2, B0: 10 }), 60);
    expect(Math.abs(r[59]! - r[60]!)).toBeGreaterThan(5);
    const s = recursive('logistic', P({ k: 0.1, B0: 10 }), 200);
    expect(s[200]!).toBeCloseTo(100, 1);
  });
  it('Kennzeichen: konstante Differenzen, konstante Quotienten', () => {
    const lin = table('linear', P({}), 5);
    expect(lin.slice(1).every((r) => Math.abs(r.diff! - 5) < 1e-12)).toBe(true);
    const ex = table('exp', P({ k: 0.2 }), 5);
    expect(ex.slice(1).every((r) => Math.abs(r.quot! - Math.exp(0.2)) < 1e-12)).toBe(true);
    const bo = table('bounded', P({ k: 0.2 }), 5);
    expect(bo.slice(1).every((r) => Math.abs(r.ratio! - (1 - Math.exp(-0.2))) < 1e-12)).toBe(true);
  });
  it('Modell aus Wertetabelle erkennen', () => {
    const vals = (kind: 'linear' | 'exp' | 'bounded' | 'logistic', p: Params, n = 12) => Array.from({ length: n }, (_, i) => value(kind, p, i));
    expect(classify(vals('linear', P({})))).toBe('linear');
    expect(classify(vals('exp', P({ k: 0.3 })))).toBe('exp');
    expect(classify(vals('bounded', P({ k: 0.3 })))).toBe('bounded');
    expect(classify(vals('logistic', P({ k: 0.6 })))).toBe('logistic');
  });
});

describe('Wachstumsmodelle: Anpassen', () => {
  it('Daten des richtigen Modells werden am besten getroffen', () => {
    for (const ds of DATASETS) {
      const start = P({ B0: ds.data[0]!.B });
      const best = fit(ds.truth, ds.data, start);
      const others = (['linear', 'exp', 'bounded', 'logistic'] as const).filter((k) => k !== ds.truth).map((k) => fit(k, ds.data, start).sse);
      // Das logistische Modell enthält das exponentielle als Grenzfall (S → ∞): dort fast gleich gut
      expect(best.sse, ds.id).toBeLessThan(Math.min(...others) * 1.05 + 1e-6);
    }
  });
  it('Anpassung findet die Parameter wieder', () => {
    const p = P({ B0: 5, k: 0.7, S: 60 });
    const data = Array.from({ length: 12 }, (_, t) => ({ t, B: value('logistic', p, t) }));
    const r = fit('logistic', data, P({ B0: 4 }));
    expect(r.p.S).toBeCloseTo(60, 2);
    expect(r.p.k).toBeCloseTo(0.7, 3);
    expect(sse('logistic', r.p, data)).toBeLessThan(1e-4);
  });
});

describe('Wachstumsmodelle: eigene Daten und Rätsel', () => {
  it('Messwerte lesen', async () => {
    const { parseData } = await import('../src/simulations/mathematik/wachstumsmodelle/model');
    expect(parseData('0;18 | 1;29 | 2;47')).toEqual([
      { t: 0, B: 18 },
      { t: 1, B: 29 },
      { t: 2, B: 47 },
    ]);
    expect(parseData('18 29 47,5 70')).toEqual([
      { t: 0, B: 18 },
      { t: 1, B: 29 },
      { t: 2, B: 47.5 },
      { t: 3, B: 70 },
    ]);
    expect(parseData('2;5\n0;1\n1;3')!.map((d) => d.t)).toEqual([0, 1, 2]);
    expect(parseData('1 2')).toBeNull();
    expect(parseData('a b c')).toBeNull();
  });
  it('Rätsel-Tabellen lassen sich am Kennzeichen erkennen', async () => {
    const { puzzle } = await import('../src/simulations/mathematik/wachstumsmodelle/model');
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 40; i++) {
      const pz = puzzle(rnd);
      expect(classify(pz.values, 0.03), JSON.stringify(pz)).toBe(pz.kind);
    }
  });
});
