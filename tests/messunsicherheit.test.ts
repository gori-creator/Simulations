import { describe, expect, it } from 'vitest';
import { calculationSteps, combinedUncertainty, dataRange, histogram, instrumentReading, linearFit, normalDensity, parseData, repeatedExperiments, resolutionUncertainty, sampleMeasurements, serializeData, squaredResiduals, statistics, timedPoints } from '../src/simulations/physik/messunsicherheit/model';

describe('Messunsicherheit – unabhängige Lehrbuchwerte', () => {
  it('rechnet den verbindlichen Fünferdatensatz mit n−1 nach', () => {
    const s = statistics([9.8, 10.1, 9.9, 10.2, 10]);
    expect(s.mean).toBeCloseTo(10, 12);
    // Abweichungsquadrate: 0,04 + 0,01 + 0,01 + 0,04 + 0 = 0,10.
    expect(s.sumSquares).toBeCloseTo(0.1, 12);
    expect(s.sampleSD).toBeCloseTo(Math.sqrt(0.1 / 4), 12);
    expect(s.sem).toBeCloseTo(Math.sqrt(0.1 / 20), 12);
  });
  it('unterscheidet keine Messung, eine Messung und keine beobachtete Streuung', () => {
    expect(statistics([]).mean).toBeNull();
    expect(statistics([10]).sampleSD).toBeNull();
    expect(statistics([10]).sem).toBeNull();
    expect(statistics([10, 10, 10]).sampleSD).toBe(0);
    expect(combinedUncertainty(0, 0.1)).toBeCloseTo(0.028867513459, 10);
    expect(combinedUncertainty(null, 0.1)).toBeNull();
  });
  it('liefert bei 1 und 3 den Mittelwert2, s=√2 und SEM1', () => {
    const s = statistics([1, 3]);
    expect(s.mean).toBe(2);
    expect(s.sampleSD).toBeCloseTo(Math.SQRT2, 12);
    expect(s.sem).toBe(1);
  });
  it('liefert für große Offsets stabile Streuungen', () => {
    const s = statistics([1e12 + 1, 1e12 + 2, 1e12 + 3]);
    expect(s.mean).toBe(1e12 + 2);
    expect(s.sampleSD).toBe(1);
    expect(() => statistics([NaN])).toThrow(RangeError);
  });
  it('wandelt Skalenauflösung und quadratische Kombination korrekt um', () => {
    expect(resolutionUncertainty(1)).toBeCloseTo(1 / Math.sqrt(12), 12);
    expect(combinedUncertainty(0.3, Math.sqrt(12) * 0.4)).toBeCloseTo(0.5, 12);
    expect(instrumentReading(10.37, 0, 0.1)).toBeCloseTo(10.4, 12);
    expect(instrumentReading(10.37, 1, 0.1)).toBeCloseTo(11.4, 12);
    expect(() => resolutionUncertainty(-1)).toThrow();
    expect(() => instrumentReading(1, 0, 0)).toThrow();
  });
  it('findet y=2t+1 exakt und unterscheidet konstante Zeit von konstantem Ort', () => {
    const f = linearFit([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }])!;
    expect(f.slope).toBe(2);
    expect(f.intercept).toBe(1);
    expect(f.sse).toBe(0);
    expect(f.rSquared).toBe(1);
    expect(linearFit([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull();
    expect(linearFit([{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }])!.rSquared).toBeNull();
    expect(linearFit([{ x: 0, y: 1 }, { x: 1, y: 3 }])!.slopeSE).toBeNull();
    expect(linearFit([])).toBeNull();
  });
  it('rechnet verrauschte Gerade von Hand nach', () => {
    // x=0,1,2; y=1,2,4. a=3/2, b=5/6, r=(1/6,-1/3,1/6).
    const f = linearFit(timedPoints([1, 2, 4], 1))!;
    expect(f.slope).toBeCloseTo(1.5, 12);
    expect(f.intercept).toBeCloseTo(5 / 6, 12);
    expect(f.sse).toBeCloseTo(1 / 6, 12);
    expect(f.slopeSE).toBeCloseTo(Math.sqrt(1 / 12), 12);
    expect(f.interceptSE).toBeCloseTo(Math.sqrt(5 / 36), 12);
    expect(f.rSquared).toBeCloseTo(27 / 28, 12);
  });
  it('prüft Invarianzen und das Minimum für viele deterministische Zufallsdatensätze', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const values = sampleMeasurements(10, 10, 0.8, 0, seed);
      const s = statistics(values);
      const shifted = statistics(values.map((v) => 3 * v + 7));
      expect(shifted.mean).toBeCloseTo(3 * s.mean! + 7, 10);
      expect(shifted.sampleSD).toBeCloseTo(3 * s.sampleSD!, 10);
      expect(s.sem! * Math.sqrt(10)).toBeCloseTo(s.sampleSD!, 12);
      const pts = timedPoints(values, 0.5);
      const f = linearFit(pts)!;
      expect(f.residuals.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 9);
      expect(squaredResiduals(pts, f.slope + 0.1, f.intercept - 0.2)).toBeGreaterThanOrEqual(f.sse - 1e-10);
    }
  });
  it('trennt Dezimalkomma von Semikolon und lehnt ungültige Eingaben vollständig ab', () => {
    expect(parseData('9,8; 10.1; −2').values).toEqual([9.8, 10.1, -2]);
    expect(parseData('').error).toBe('empty');
    for (const input of ['1;;2', '2foo;3', '<script>', 'Infinity', '1,2,3']) expect(parseData(input).error).toBe('number');
    expect(parseData('101').error).toBe('range');
    expect(parseData(Array(21).fill('1').join(';')).error).toBe('count');
    expect(parseData(serializeData([9.8, -1, 2.123])).values).toEqual([9.8, -1, 2.123]);
  });
  it('erhält Histogramm-Anzahlen auch am rechten Rand und bei identischen Werten', () => {
    for (const values of [[1, 2, 3, 4], [10, 10, 10], [-1, 0, 1]]) {
      expect(histogram(values).reduce((n, b) => n + b.count, 0)).toBe(values.length);
      const range = dataRange(values);
      expect(range[0]).toBeLessThan(Math.min(...values));
      expect(range[1]).toBeGreaterThan(Math.max(...values));
    }
  });
  it('macht die Generatoren reproduzierbar und erhält systematische Versätze', () => {
    expect(sampleMeasurements(5, 10, 0.2, 0, 17)).toEqual(sampleMeasurements(5, 10, 0.2, 0, 17));
    expect(sampleMeasurements(5, 10, 0, 1, 17)).toEqual([11, 11, 11, 11, 11]);
    const a = repeatedExperiments(25, 1, 0, 17);
    const b = repeatedExperiments(25, 1, 2, 17);
    expect(a.theoreticalSEM).toBeCloseTo(0.2, 12);
    b.means.forEach((v, i) => expect(v - a.means[i]!).toBeCloseTo(2, 12));
    expect(repeatedExperiments(100, 1, 0, 17).theoreticalSEM).toBe(0.1);
    expect(repeatedExperiments(5, 0, 0, 17).covered).toBe(40);
    expect(repeatedExperiments(5, 0, 1, 17).covered).toBe(0);
    expect(() => repeatedExperiments(0, 1, 0, 1)).toThrow();
    expect(normalDensity(0, 0, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12);
    expect(normalDensity(0, 0, 0)).toBeNull();
  });
  it('endet die schrittweise Rechnung bei derselben Quadratsumme', () => {
    const rows = calculationSteps([9.8, 10.1, 9.9, 10.2, 10]);
    expect(rows[0]!.deviation).toBeCloseTo(-0.2, 12);
    expect(rows[0]!.square).toBeCloseTo(0.04, 12);
    expect(rows.at(-1)!.partialSquareSum).toBeCloseTo(0.1, 12);
  });
});

describe('Messschieber mit Nonius', () => {
  it('1/10-Nonius: 23,4 mm → Hauptskala 23, Strich 4', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    const r = m.noniusReading(23.4, '0.1');
    expect(r.mainMm).toBe(23);
    expect(r.k).toBe(4);
    expect(r.reading).toBeCloseTo(23.4, 10);
    // Strich 4 liegt genau auf einem Hauptskalenstrich: 23,4 + 4·0,9 = 27,0
    expect(m.noniusLine(23.4, 4, '0.1')).toBeCloseTo(27, 10);
    expect(m.noniusMismatch(23.4, 4, '0.1')).toBeLessThan(1e-9);
    expect(m.noniusMismatch(23.4, 3, '0.1')).toBeCloseTo(0.1, 10);
  });
  it('1/20-Nonius: 12,35 mm → Strich 7; Rundung auf 0,05 mm', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    const r = m.noniusReading(12.35, '0.05');
    expect(r.mainMm).toBe(12);
    expect(r.k).toBe(7);
    expect(m.noniusReading(12.37, '0.05').reading).toBeCloseTo(12.35, 10);
    expect(m.noniusReading(9.98, '0.1').reading).toBeCloseTo(10, 10);
    expect(m.noniusScale('0.05').length).toBe(39);
  });
});

describe('Fortpflanzung von Unsicherheiten', () => {
  it('Fläche (2,0 ± 0,1)·(3,0 ± 0,1): Gauß ≈ 0,36, Größtfehler 0,5', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    const r = m.propagate(m.FORMULAS.area, [2, 3], [0.1, 0.1])!;
    expect(r.value).toBeCloseTo(6, 12);
    expect(r.uGauss).toBeCloseTo(0.3606, 3);
    expect(r.uMax).toBeCloseTo(0.5, 12);
    expect(r.dominant).toBe(0);
  });
  it('Pendel: l = 1,000 ± 0,005 m, T = 2,006 ± 0,010 s → g ≈ 9,81 ± 0,11 m/s²', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    const r = m.propagate(m.FORMULAS.pendulum, [1, 2.006], [0.005, 0.01])!;
    expect(r.value).toBeCloseTo(9.8106, 3);
    expect(r.relGauss).toBeCloseTo(0.01115, 4);
    expect(r.dominant).toBe(1);
    const rr = m.roundResult(r.value, r.uGauss);
    expect(rr.value).toBeCloseTo(9.81, 10);
    expect(rr.u).toBeCloseTo(0.11, 10);
    expect(m.varianceShares(r)[1]).toBeGreaterThan(0.75);
  });
  it('Runden: 2 Ziffern bei führender 1 oder 2, sonst 1', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    expect(m.roundResult(6.0, 0.3606)).toMatchObject({ value: 6, u: 0.4, decimals: 1 });
    expect(m.roundResult(123.456, 2.34)).toMatchObject({ value: 123.5, u: 2.4, decimals: 1 });
    expect(m.roundResult(0.012345, 0.00073)).toMatchObject({ u: 0.0008 });
  });
  it('Monte-Carlo stimmt mit der Gauß-Formel überein', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    const r = m.propagate(m.FORMULAS.speed, [10, 2], [0.2, 0.05])!;
    const mc = m.monteCarlo(m.FORMULAS.speed, [10, 2], [0.2, 0.05], 4000, 3);
    const s = m.statistics(mc);
    expect(s.mean!).toBeCloseTo(5, 1);
    expect(s.sampleSD! / r.uGauss).toBeGreaterThan(0.93);
    expect(s.sampleSD! / r.uGauss).toBeLessThan(1.07);
    expect(m.propagate(m.FORMULAS.speed, [10, 0], [0.1, 0.1])).toBeNull();
  });
});

describe('Zeit stoppen', () => {
  it('Pendel 1 m: T ≈ 2,006 s; 10 Schwingungen in 20,06 s → T = 2,006 s', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    expect(m.PENDULUM_T).toBeCloseTo(2.006, 3);
    expect(m.periodFromStops(20.06, 10)).toBeCloseTo(2.006, 12);
    expect(() => m.periodFromStops(2, 0)).toThrow();
  });
  it('über 10 Schwingungen zehnmal genauer als über eine', async () => {
    const m = await import('../src/simulations/physik/messunsicherheit/model');
    expect(m.stopUncertainty(1) / m.stopUncertainty(10)).toBeCloseTo(10, 12);
    const one = m.simulatedStops(1, 400, 5).map((t) => m.periodFromStops(t, 1));
    const ten = m.simulatedStops(10, 400, 5).map((t) => m.periodFromStops(t, 10));
    const s1 = m.statistics(one).sampleSD!;
    const s10 = m.statistics(ten).sampleSD!;
    expect(s1 / s10).toBeGreaterThan(7);
    expect(s1 / s10).toBeLessThan(13);
    expect(m.statistics(ten).mean!).toBeCloseTo(m.PENDULUM_T, 2);
    expect(s1).toBeCloseTo(m.stopUncertainty(1), 1);
  });
});
