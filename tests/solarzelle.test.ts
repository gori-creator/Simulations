import { describe, expect, it } from 'vitest';
import { arrayCurrent, arrayVoc, maxPower, moduleVoc, operatingPoint, photoCurrent, type Array } from '../src/simulations/physik/solarzelle/model';

const base: Array = { series: 1, parallel: 1, E: 1000, angle: 0, shade: 0 };

describe('Solarmodul', () => {
  it('Kurzschlussstrom ∝ Bestrahlung, Leerlaufspannung etwa 2 V', () => {
    expect(photoCurrent(500, 0)).toBeCloseTo(0.25, 10);
    const voc = moduleVoc(photoCurrent(1000, 0));
    expect(voc).toBeGreaterThan(1.8);
    expect(voc).toBeLessThan(2.5);
  });

  it('schräges Licht: weniger Strom (cos-Gesetz)', () => {
    expect(photoCurrent(1000, 60)).toBeCloseTo(0.25, 10);
  });
});

describe('Reihe und parallel', () => {
  it('Reihe: Spannungen addieren sich', () => {
    expect(arrayVoc({ ...base, series: 3 })).toBeCloseTo(3 * arrayVoc(base), 6);
  });

  it('parallel: Ströme addieren sich', () => {
    expect(arrayCurrent(0.5, { ...base, parallel: 2 })).toBeCloseTo(2 * arrayCurrent(0.5, base), 6);
  });

  it('Schatten auf einem Modul bremst den ganzen Strang', () => {
    const a = { ...base, series: 3 };
    const s = { ...a, shade: 0.5 };
    expect(arrayCurrent(0.1, s)).toBeLessThan(0.6 * arrayCurrent(0.1, a));
  });
});

describe('Arbeitspunkt und MPP', () => {
  it('Arbeitspunkt liegt auf der Kennlinie und der Widerstandsgeraden', () => {
    const op = operatingPoint(base, 4);
    expect(op.I).toBeCloseTo(arrayCurrent(op.U, base), 4);
    expect(op.U / op.I).toBeCloseTo(4, 6);
  });

  it('MPP liegt unterhalb der Leerlaufspannung, Füllfaktor 0,6–0,85', () => {
    const m = maxPower(base);
    const ff = m.P / (arrayVoc(base) * arrayCurrent(0, base));
    expect(ff).toBeGreaterThan(0.6);
    expect(ff).toBeLessThan(0.85);
  });
});
