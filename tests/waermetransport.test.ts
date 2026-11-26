import { describe, expect, it } from 'vitest';
import {
  checkTask,
  conductionPower,
  conductionStep,
  CONTAINERS,
  cooling,
  coolingTime,
  diffusivity,
  energyKWh,
  heatLoss,
  makeTask,
  MATERIALS,
  netRadiation,
  parseAnswer,
  radiatedPower,
  uValue,
  wallTemperatures,
  WINDOWS,
} from '../src/simulations/physik/waermetransport/model';

describe('Wärmetransport', () => {
  it('Wärmestrom durch eine Schicht', () => {
    // 1 m² Glas, 4 mm, 20 K: 1 · 1 · 20 / 0,004 = 5000 W
    expect(conductionPower(1, 1, 20, 0.004)).toBeCloseTo(5000, 6);
  });

  it('Metalle leiten viel besser als Holz und Styropor', () => {
    expect(MATERIALS.copper.lambda / MATERIALS.wood.lambda).toBeGreaterThan(1000);
    expect(diffusivity('copper')).toBeGreaterThan(diffusivity('iron'));
  });

  it('Stab strebt einem linearen Temperaturverlauf zu', () => {
    const n = 21;
    const T = Array.from({ length: n }, (_, i) => (i === 0 ? 100 : 20));
    const a = diffusivity('copper');
    for (let k = 0; k < 2000; k++) conductionStep(T, a, 0.01, 1);
    // linear zwischen 100 und 20
    expect(T[10]!).toBeCloseTo(60, 1);
    expect(T[5]!).toBeCloseTo(80, 1);
  });

  it('Stefan-Boltzmann: doppelte Temperatur, 16-fache Leistung', () => {
    expect(radiatedPower(1, 1, 600) / radiatedPower(1, 1, 300)).toBeCloseTo(16, 10);
    expect(netRadiation(1, 1, 300, 300)).toBe(0);
    // Schwarzer Körper bei 300 K: etwa 459 W/m²
    expect(radiatedPower(1, 1, 300)).toBeCloseTo(459.3, 0);
  });

  it('U-Wert: Dämmung senkt den Wärmeverlust', () => {
    const brick = { lambda: 0.8, d: 0.24 };
    const u0 = uValue([brick]);
    expect(u0).toBeCloseTo(1 / (0.13 + 0.3 + 0.04), 10);
    const u1 = uValue([brick, { lambda: 0.035, d: 0.12 }]);
    expect(u1).toBeLessThan(0.3);
    const t = wallTemperatures([brick, { lambda: 0.035, d: 0.12 }], 20, -10);
    expect(t.length).toBe(3);
    expect(t[2]!).toBeCloseTo(-10 + u1 * 30 * 0.04, 8);
  });
});

describe('Abkühlen von Tee', () => {
  it('Newton’sches Abkühlungsgesetz', () => {
    expect(cooling(80, 20, 0.02, 0)).toBe(80);
    expect(cooling(80, 20, 0.02, 50)).toBeCloseTo(20 + 60 * Math.exp(-1), 10);
    expect(coolingTime(80, 20, 0.02, 20 + 60 * Math.exp(-1))).toBeCloseTo(50, 9);
    expect(coolingTime(80, 20, 0.02, 15)).toBe(Infinity);
  });

  it('Reihenfolge: offener Becher kühlt am schnellsten, Thermoskanne am langsamsten', () => {
    const k = (c: keyof typeof CONTAINERS) => CONTAINERS[c].k;
    expect(k('becher')).toBeGreaterThan(k('deckel'));
    expect(k('deckel')).toBeGreaterThan(k('doppel'));
    expect(k('doppel')).toBeGreaterThan(k('thermos'));
    // Becher: von 85 °C nach etwa 20 Minuten unter 65 °C; Thermoskanne nach 6 h noch über 65 °C
    expect(cooling(85, 20, k('becher'), 20)).toBeLessThan(65);
    expect(cooling(85, 20, k('thermos'), 360)).toBeGreaterThan(65);
    for (const c of Object.values(CONTAINERS)) expect(c.share.leitung + c.share.stroemung + c.share.strahlung).toBeCloseTo(1, 12);
  });
});

describe('Fenster', () => {
  it('Verlust und Energie', () => {
    expect(heatLoss(5.8, 4, 25)).toBeCloseTo(580, 10);
    expect(heatLoss(WINDOWS.dreifach, 4, 25)).toBeCloseTo(70, 10);
    expect(energyKWh(580, 24)).toBeCloseTo(13.92, 10);
  });
});

describe('Übung Wärmetransport', () => {
  it('liest Zahlen mit Komma, Punkt und Einheit', () => {
    expect(parseAnswer('12,5 °C')).toBe(12.5);
    expect(parseAnswer('3')).toBe(3);
    expect(parseAnswer('drei')).toBeNull();
  });

  it('jede Aufgabe ist mit ihrer Lösung richtig, mit einer falschen nicht', () => {
    for (let n = 1; n <= 200; n++) {
      const t = makeTask(n);
      expect(Number.isFinite(t.answer)).toBe(true);
      expect(checkTask(t, String(t.answer))).toBe(true);
      expect(checkTask(t, String(t.answer).replace('.', ','))).toBe(true);
      expect(checkTask(t, String(t.answer * 1.3 + 1))).toBe(false);
      expect(t.text.de).not.toMatch(/\d\.\d/);
      expect(t.text.en).not.toMatch(/\d,\d/);
    }
  });

  it('Zuordnungsaufgaben haben die Antworten 1, 2 oder 3', () => {
    for (let n = 1; n <= 80; n++) {
      const t = makeTask(n);
      if (t.kind === 'which' || t.kind === 'which2') expect([1, 2, 3]).toContain(t.answer);
    }
  });
});
