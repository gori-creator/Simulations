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
  householdCurrent,
  makeTask,
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
