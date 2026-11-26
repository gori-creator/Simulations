import { describe, expect, it } from 'vitest';
import {
  bikeForces,
  bikePower,
  bikeSpeedFor,
  checkTask,
  DEVICES,
  EFFICIENCY,
  efficiencySplit,
  energyJ,
  FLOOR_H,
  floorsFor,
  G,
  hydroPower,
  liftSpeed,
  liftTime,
  makeTask,
  power,
  PS,
  REFERENCES,
  toKWh,
  work,
} from '../src/simulations/physik/leistung/model';

describe('Arbeit und Leistung', () => {
  it('Hubarbeit 50 kg auf 6 m', () => {
    expect(work(50, 6)).toBeCloseTo(2943, 0);
  });

  it('schneller = mehr Leistung', () => {
    expect(power(50, 6, 6)).toBeCloseTo(2 * power(50, 6, 12), 9);
    expect(power(50, 6, 6)).toBeCloseTo(490.5, 1);
  });

  it('1 PS ≈ 736 W, Vergleichswerte aufsteigend', () => {
    expect(PS).toBeCloseTo(735.5, 1);
    for (let i = 1; i < REFERENCES.length; i++) expect(REFERENCES[i]!.P).toBeGreaterThan(REFERENCES[i - 1]!.P);
  });
});

describe('Heben, Energie, Wasserkraft', () => {
  it('Hubzeit und Hubgeschwindigkeit passen zusammen', () => {
    const t = liftTime(500, 12, 5000);
    expect(t).toBeCloseTo((500 * G * 12) / 5000, 9);
    expect(liftSpeed(500, 5000) * t).toBeCloseTo(12, 9);
    expect(liftTime(500, 12, 10000)).toBeCloseTo(t / 2, 9);
  });
  it('Energie, kWh und Stockwerke', () => {
    expect(energyJ(2000, 60)).toBe(7.2e6);
    expect(toKWh(energyJ(2000, 60))).toBeCloseTo(2, 9);
    expect(floorsFor(work(55, FLOOR_H) * 10, 55)).toBeCloseTo(10, 9);
    for (const d of Object.values(DEVICES)) expect(d.P).toBeGreaterThan(0);
  });
  it('Wasserkraft wächst mit Menge und Höhe', () => {
    expect(hydroPower(1, 10, 1)).toBeCloseTo(1000 * G * 10, 6);
    expect(hydroPower(2, 10)).toBeCloseTo(2 * hydroPower(1, 10), 6);
    expect(hydroPower(20, 300) / 1e6).toBeGreaterThan(40);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(3)).toEqual(makeTask(3));
    expect(new Set(Array.from({ length: 16 }, (_, i) => makeTask(i + 1).kind)).size).toBe(8);
  });
  it('erkennt die hinterlegte Antwort, auch mit Komma und Einheit', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(Number.isFinite(t.answer)).toBe(true);
      const v = t.tol === 0 ? String(t.answer) : String(Math.round(t.answer * 100) / 100).replace('.', ',');
      expect(checkTask(t, v)).toBe(true);
      expect(checkTask(t, String(t.answer * 2 + 5))).toBe(false);
    }
    expect(checkTask(makeTask(1), 'abc')).toBeNull();
    expect(checkTask(makeTask(2), `${makeTask(2).answer} W`)).toBe(true);
  });
  it('Vergleichsaufgaben sind eindeutig', () => {
    for (let i = 6; i <= 800; i += 8) {
      const t = makeTask(i);
      expect(t.kind).toBe('compare');
      expect([1, 2]).toContain(t.answer);
    }
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});

describe('Fahrrad und Wirkungsgrad', () => {
  it('bergauf überwiegt der Hangabtrieb, schnell in der Ebene der Luftwiderstand', () => {
    const up = bikeForces(85, 8, 12 / 3.6);
    expect(up.hang).toBeGreaterThan(up.air + up.roll);
    const fast = bikeForces(85, 0, 35 / 3.6);
    expect(fast.hang).toBe(0);
    expect(fast.air).toBeGreaterThan(fast.roll);
  });
  it('P = F · v und Höchsttempo passen zusammen', () => {
    const v = 5;
    expect(bikePower(80, 3, v)).toBeCloseTo(bikeForces(80, 3, v).total * v, 9);
    const vmax = bikeSpeedFor(150, 80, 3);
    expect(bikePower(80, 3, vmax)).toBeCloseTo(150, 1);
  });
  it('Wirkungsgrad teilt die Leistung in Nutzen und Verlust', () => {
    const s = efficiencySplit('gluehlampe', 60);
    expect(s.use).toBeCloseTo(3, 9);
    expect(s.use + s.loss).toBeCloseTo(60, 9);
    for (const e of Object.values(EFFICIENCY)) {
      expect(e.eta).toBeGreaterThan(0);
      expect(e.eta).toBeLessThan(1);
    }
  });
});
