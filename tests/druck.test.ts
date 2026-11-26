import { describe, expect, it } from 'vitest';
import {
  airPressure,
  barometerHeight,
  bottomPressure,
  breeze,
  checkTask,
  hemisphereForce,
  hydraulic,
  hydrostatic,
  makeTask,
  outflowSpeed,
  parseAnswer,
  pressure,
  pumpLift,
  tapPressure,
} from '../src/simulations/physik/druck/model';

describe('Druck', () => {
  it('p = F / A', () => {
    // 700 N auf 2 · 150 cm² Schuhsohle
    expect(pressure(700, 0.03)).toBeCloseTo(23333.3, 0);
  });

  it('Hydraulik: Kraftverstärkung, Wegverkleinerung, Arbeit bleibt gleich', () => {
    const h = hydraulic(100, 0.001, 0.1, 0.5);
    expect(h.F2).toBeCloseTo(10000, 6);
    expect(h.s2).toBeCloseTo(0.005, 10);
    expect(100 * 0.5).toBeCloseTo(h.F2 * h.s2, 8);
  });

  it('Schweredruck: 10 m Wasser ≈ 1 bar', () => {
    expect(hydrostatic(1000, 10)).toBeCloseTo(98100, 6);
  });

  it('Luftdruck: auf etwa 5,8 km halbiert', () => {
    expect(airPressure(0)).toBeCloseTo(1013.25, 6);
    expect(airPressure(8400 * Math.LN2)).toBeCloseTo(1013.25 / 2, 6);
  });

  it('Land-See-Wind', () => {
    expect(breeze(30, 20)).toBe('land');
    expect(breeze(10, 16)).toBe('sea');
    expect(breeze(15, 15)).toBe('none');
  });
});


describe('Verbundene Gefäße und Wasserturm', () => {
  it('Bodendruck hängt nur von der Höhe ab (hydrostatisches Paradoxon)', () => {
    expect(bottomPressure(1000, 0.3, 0.01, 10).p).toBe(3000);
    expect(bottomPressure(1000, 0.3, 1, 10).p).toBe(3000);
    expect(bottomPressure(1000, 0.3, 0.02, 10).F).toBeCloseTo(60, 12);
  });

  it('Wasserturm: Überdruck sinkt mit der Höhe des Hahns, oberhalb des Spiegels kein Wasser', () => {
    expect(tapPressure(40, 0, 1000, 10)).toBe(400000);
    expect(tapPressure(40, 30, 1000, 10)).toBe(100000);
    expect(tapPressure(20, 30)).toBe(0);
    expect(outflowSpeed(5, 10)).toBe(10);
    expect(outflowSpeed(-1)).toBe(0);
  });
});

describe('Druck messen', () => {
  it('Barometer: rund 760 mm Quecksilber, rund 10 m Wasser', () => {
    expect(barometerHeight(1013.25, 13546) * 1000).toBeCloseTo(762, 0);
    expect(barometerHeight(1013.25, 1000)).toBeCloseTo(10.33, 2);
  });

  it('Magdeburger Halbkugeln: Kraft aus Druckunterschied und Kreisfläche', () => {
    expect(hemisphereForce(0.25, 0, 1000)).toBeCloseTo(100000 * Math.PI * 0.0625, 6);
    expect(hemisphereForce(0.25, 1013.25)).toBe(0);
    expect(hemisphereForce(0.25, 1200)).toBe(0);
  });
});

describe('Hydraulische Presse: Pumpen', () => {
  it('der große Kolben steigt um n · s₁ · A₁ / A₂; die Arbeit bleibt gleich', () => {
    const A1 = 1;
    const A2 = 100;
    const s2 = pumpLift(10, 0.1, A1, A2);
    expect(s2).toBeCloseTo(0.01, 12);
    const F1 = 100;
    const F2 = (F1 * A2) / A1;
    expect(F1 * 10 * 0.1).toBeCloseTo(F2 * s2, 9);
  });
});

describe('Übung Druck', () => {
  it('liest Zahlen mit Komma, Punkt und Einheit', () => {
    expect(parseAnswer('1,013')).toBe(1.013);
    expect(parseAnswer('2000 Pa')).toBe(2000);
    expect(parseAnswer('x')).toBeNull();
  });

  it('jede Aufgabe ist mit ihrer Lösung richtig, mit einer falschen nicht', () => {
    for (let n = 1; n <= 200; n++) {
      const t = makeTask(n);
      expect(Number.isFinite(t.answer)).toBe(true);
      expect(checkTask(t, String(t.answer))).toBe(true);
      expect(checkTask(t, String(t.answer).replace('.', ','))).toBe(true);
      expect(checkTask(t, String(t.answer * 1.3))).toBe(false);
      expect(t.text.de).not.toMatch(/\d\.\d/);
      expect(t.text.en).not.toMatch(/\d,\d/);
    }
  });

  it('neun Aufgabenarten reihum, gleiche Nummer gleiche Aufgabe', () => {
    expect(new Set(Array.from({ length: 9 }, (_, i) => makeTask(i + 1).kind)).size).toBe(9);
    expect(makeTask(12)).toEqual(makeTask(12));
  });
});
