import { describe, expect, it } from 'vitest';
import { posterior, priorSpam, TRAIN, VOCAB, wordStats } from '../src/kurse/ki-labor/models/bayes';
import { ATTRS, bestAttr, DAYS, entropy, gain, split } from '../src/kurse/ki-labor/models/id3';
import { bestDegree, errorCurve, polyfit, solve, TEST, TRAIN as PTRAIN, TRAIN_BIG } from '../src/kurse/ki-labor/models/polyfit';
import { DATA, descend, ETAS, fit, gradient, maxCurvature, mse } from '../src/kurse/ki-labor/models/regression';

/** KI-Labor, Welt „Lernen aus Daten“. */
describe('Regression und Gradientenabstieg', () => {
  it('Normalgleichung liefert das Minimum (Gradient null)', () => {
    const { m, b } = fit();
    const g = gradient(m, b);
    expect(Math.abs(g.dm)).toBeLessThan(1e-9);
    expect(Math.abs(g.db)).toBeLessThan(1e-9);
    expect(mse(m, b)).toBeLessThan(mse(m + 0.5, b));
    expect(mse(m, b)).toBeLessThan(mse(m, b - 2));
  });

  it('Lernraten: zu klein langsam, mittel gut, zu groß explodiert', () => {
    const minE = mse(fit().m, fit().b);
    const run = (eta: number, n: number) => {
      let p = { m: 0, b: 0 };
      for (let k = 0; k < n; k++) p = descend(p.m, p.b, eta);
      return mse(p.m, p.b);
    };
    expect(run(ETAS[1], 60)).toBeLessThan(1.1 * minE);
    expect(run(ETAS[0], 60)).toBeGreaterThan(1.1 * minE);
    expect(run(ETAS[2], 30)).toBeGreaterThan(1e6);
    // Grenze 2/λmax liegt zwischen guter und zu großer Lernrate
    expect(2 / maxCurvature()).toBeGreaterThan(ETAS[1]);
    expect(2 / maxCurvature()).toBeLessThan(ETAS[2]);
    expect(DATA).toHaveLength(10);
  });
});

describe('Überanpassung', () => {
  it('Gleichungssystem lösen', () => {
    expect(solve([[2, 1], [1, 3]], [3, 5]).map((v) => Math.round(v * 1e6) / 1e6)).toEqual([0.8, 1.4]);
  });

  it('Grad 9 interpoliert die 10 Trainingspunkte, versagt aber im Test', () => {
    const rows = errorCurve(PTRAIN);
    expect(rows[9]!.train).toBeLessThan(1e-6);
    expect(rows[9]!.test).toBeGreaterThan(5 * Math.min(...rows.map((r) => r.test)));
    // Trainingsfehler fällt (fast) monoton mit dem Grad
    for (let d = 1; d <= 9; d++) expect(rows[d]!.train).toBeLessThanOrEqual(rows[d - 1]!.train + 1e-9);
    const best = bestDegree();
    expect(best).toBeGreaterThanOrEqual(3);
    expect(best).toBeLessThanOrEqual(7);
  });

  it('mehr Daten zähmen Grad 9', () => {
    const small = errorCurve(PTRAIN)[9]!.test;
    const big = errorCurve(TRAIN_BIG)[9]!.test;
    expect(big).toBeLessThan(small / 10);
    expect(TEST.length).toBe(40);
  });

  it('Strafterm macht Koeffizienten kleiner', () => {
    const plain = polyfit(PTRAIN, 9);
    const ridge = polyfit(PTRAIN, 9, 0.1);
    const norm = (c: number[]) => c.slice(1).reduce((s, v) => s + v * v, 0);
    expect(norm(ridge.coef)).toBeLessThan(norm(plain.coef));
  });
});

describe('Bayes-Spamfilter', () => {
  it('Grundrate und Faktoren', () => {
    expect(priorSpam()).toBeCloseTo(5 / 12);
    const st = wordStats();
    expect(st).toHaveLength(VOCAB.length);
    const gratis = st.find((s) => s.word === 'gratis')!;
    expect(gratis.pSpam / gratis.pHam).toBeCloseTo(4 / 7 / (2 / 9));
    expect(TRAIN.length).toBe(12);
  });

  it('Spamwörter erhöhen, normale Wörter senken die Wahrscheinlichkeit', () => {
    expect(posterior([]).p).toBeCloseTo(priorSpam());
    expect(posterior(['gratis', 'gewinn', 'klick']).p).toBeGreaterThan(0.95);
    expect(posterior(['mama', 'morgen', 'hausaufgaben']).p).toBeLessThan(0.05);
    expect(posterior(['gratis'], 0.1).p).toBeLessThan(posterior(['gratis'], 0.8).p);
  });
});

describe('ID3', () => {
  it('Entropie und Gewinne wie im Lehrbuch', () => {
    expect(entropy(DAYS)).toBeCloseTo(0.940, 3);
    expect(gain(DAYS, 'wetter')).toBeCloseTo(0.247, 3);
    expect(gain(DAYS, 'feuchte')).toBeCloseTo(0.152, 3);
    expect(gain(DAYS, 'wind')).toBeCloseTo(0.048, 3);
    expect(gain(DAYS, 'temperatur')).toBeCloseTo(0.029, 3);
    expect(bestAttr(DAYS, ATTRS)).toBe('wetter');
  });

  it('Teilbäume: sonnig → Luftfeuchte, Regen → Wind, bewölkt rein', () => {
    const parts = split(DAYS, 'wetter');
    expect(bestAttr(parts.get('sonnig')!, ['temperatur', 'feuchte', 'wind'])).toBe('feuchte');
    expect(bestAttr(parts.get('regen')!, ['temperatur', 'feuchte', 'wind'])).toBe('wind');
    expect(entropy(parts.get('bewoelkt')!)).toBe(0);
  });
});
