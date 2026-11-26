import { describe, expect, it } from 'vitest';
import {
  bodyCurrent,
  BREAKER,
  checkTask,
  contactVoltage,
  cost,
  current,
  danger,
  faultOutcome,
  fuseBlows,
  holdForce,
  householdCurrent,
  layerThickness,
  makeTask,
  platedMass,
  power,
} from '../src/simulations/physik/stromwirkungen/model';

describe('Stromwirkungen und Sicherung', () => {
  it('mehr Spannung → mehr Strom', () => {
    expect(current(12, 'lampe', false)).toBeGreaterThan(current(6, 'lampe', false));
  });

  it('Kurzschluss: sehr großer Strom, Sicherung brennt durch', () => {
    const I = current(6, 'lampe', true);
    expect(I).toBeGreaterThan(10);
    expect(fuseBlows(I, 2)).toBe(true);
    expect(fuseBlows(current(6, 'lampe', false), 2)).toBe(false);
    expect(power(6, 'lampe', true)).toBe(0);
  });
});

describe('Gefahren', () => {
  it('Batterie ungefährlich, Steckdose lebensgefährlich', () => {
    expect(danger(bodyCurrent(1.5, false))).toBe('none');
    expect(danger(bodyCurrent(230, false))).toBe('deadly');
  });

  it('nasse Haut erhöht den Strom', () => {
    expect(bodyCurrent(24, true)).toBeGreaterThan(bodyCurrent(24, false));
    expect(danger(bodyCurrent(24, true))).toBe('cramp');
  });
});

describe('Haushalt', () => {
  it('Ströme addieren sich, über 16 A löst die Sicherung aus', () => {
    expect(householdCurrent(['kocher'])).toBeCloseTo(2000 / 230, 10);
    expect(householdCurrent(['kocher', 'toaster', 'lampe', 'laden'])).toBeLessThan(BREAKER);
    expect(householdCurrent(['kocher', 'foehn', 'heizer'])).toBeGreaterThan(BREAKER);
  });
  it('Kosten: 2 kW eine Stunde bei 0,35 €/kWh = 0,70 €', () => {
    expect(cost(2000, 1)).toBeCloseTo(0.7, 12);
  });
});

describe('Schutzmaßnahmen', () => {
  it('mit Schutzleiter löst die Sicherung aus, niemand wird durchströmt', () => {
    const o = faultOutcome(true, false, true);
    expect(o.breaker).toBe(true);
    expect(o.bodyMA).toBe(0);
  });
  it('ohne Schutzleiter: 115 mA, lebensgefährlich; mit FI wird abgeschaltet', () => {
    expect(faultOutcome(false, false, true).bodyMA).toBeCloseTo(115, 6);
    expect(faultOutcome(false, false, true).danger).toBe('deadly');
    expect(faultOutcome(false, true, true).rcd).toBe(true);
    expect(faultOutcome(false, false, false).bodyMA).toBe(0);
  });
});

describe('Vogel auf der Leitung', () => {
  it('auf einem Seil liegt fast keine Spannung an', () => {
    expect(contactVoltage('eins')).toBeLessThan(0.01);
    expect(contactVoltage('zwei')).toBe(400);
    expect(contactVoltage('boden')).toBe(230);
  });
});

describe('Übung Strom', () => {
  it('jede Aufgabe ist mit ihrer Antwort richtig, mit einer falschen nicht', () => {
    for (let n = 1; n <= 200; n++) {
      const t = makeTask(n);
      expect(checkTask(t, String(t.answer))).toBe(true);
      expect(checkTask(t, String(t.answer).replace('.', ','))).toBe(true);
      expect(checkTask(t, String(t.answer * 1.5 + 1))).toBe(false);
      if (t.choices) expect(t.answer).toBeLessThanOrEqual(t.choices.length);
      expect(t.text.de).not.toMatch(/\d\.\d/);
      expect(t.text.en).not.toMatch(/\d,\d/);
    }
  });
});

describe('Verkupfern und Schrottkran', () => {
  it('Faraday: etwa 1,19 g Kupfer und 4 g Silber pro Amperestunde', () => {
    expect(platedMass(1, 60, 'cu')).toBeCloseTo(1.186, 2);
    expect(platedMass(1, 60, 'ag')).toBeCloseTo(4.025, 2);
    expect(platedMass(2, 30, 'cu')).toBeCloseTo(platedMass(1, 60, 'cu'), 9);
  });
  it('Schichtdicke in Mikrometern', () => {
    // 1 g Kupfer auf 50 cm²: 1 / (8,96 · 50) cm ≈ 22 µm
    expect(layerThickness(1, 'cu', 50)).toBeCloseTo(22.3, 1);
  });
  it('Haltekraft wächst mit Windungen mal Strom und bleibt begrenzt', () => {
    expect(holdForce(500, 0)).toBe(0);
    expect(holdForce(500, 2)).toBeCloseTo(holdForce(1000, 1), 9);
    expect(holdForce(1000, 5)).toBeGreaterThan(holdForce(500, 3));
    expect(holdForce(1000, 5)).toBeLessThan(12000);
    // Beispiele: 500 Windungen, 3 A heben 600 kg; 300 Windungen, 2 A nicht 1000 kg
    expect(holdForce(500, 3)).toBeGreaterThan(600 * 9.81);
    expect(holdForce(300, 2)).toBeLessThan(1000 * 9.81);
  });
  it('neue Übungsarten kommen vor und sind lösbar', () => {
    const kinds = new Set(Array.from({ length: 16 }, (_, i) => makeTask(i + 1).kind));
    expect(kinds.size).toBe(8);
    for (let n = 1; n <= 80; n++) {
      const t = makeTask(n);
      if (t.kind === 'plate' || t.kind === 'magnet') {
        expect(checkTask(t, String(Math.round(t.answer * 100) / 100).replace('.', ','))).toBe(true);
        expect(t.answer).toBeGreaterThan(0);
      }
    }
  });
});
