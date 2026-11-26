import { describe, expect, it } from 'vitest';
import {
  ALPHA,
  bimetalDeflection,
  cableSag,
  capillaryRise,
  checkTask,
  gapWidth,
  gasVolume,
  ICE_DENSITY,
  lengthChange,
  liquidVolume,
  makeTask,
  parseAnswer,
  thermostatStep,
  waterDensity,
} from '../src/simulations/physik/waermeausdehnung/model';

describe('Wärmeausdehnung', () => {
  it('Stahlbrücke: 100 m, 40 K → 4,8 cm', () => {
    expect(lengthChange(ALPHA.steel, 100, 40)).toBeCloseTo(0.048, 10);
  });

  it('Aluminium dehnt sich etwa doppelt so stark wie Stahl', () => {
    expect(ALPHA.aluminium / ALPHA.steel).toBeGreaterThan(1.8);
  });

  it('Gas: von 0 °C auf 273 °C verdoppelt sich das Volumen', () => {
    expect(gasVolume(1, 0, 273.15)).toBeCloseTo(2, 10);
  });

  it('Wasser hat bei etwa 4 °C die größte Dichte', () => {
    let best = 0;
    for (let t = 0; t <= 10; t += 0.01) if (waterDensity(t) > waterDensity(best)) best = t;
    expect(best).toBeCloseTo(3.98, 1);
    expect(waterDensity(4)).toBeCloseTo(999.97, 1);
    expect(waterDensity(20)).toBeCloseTo(998.2, 1);
    expect(waterDensity(100)).toBeCloseTo(958.4, 0);
    expect(ICE_DENSITY).toBeLessThan(waterDensity(0));
  });
});

describe('Flüssigkeiten und Thermometer', () => {
  it('Ethanol dehnt sich stärker aus als Quecksilber, Wasser hat bei 4 °C sein kleinstes Volumen', () => {
    expect(liquidVolume('ethanol', 70) - 1).toBeCloseTo(1.1e-3 * 50, 12);
    expect(liquidVolume('mercury', 70) - 1).toBeCloseTo(0.18e-3 * 50, 12);
    expect(liquidVolume('water', 20)).toBeCloseTo(1, 12);
    expect(liquidVolume('water', 4)).toBeLessThan(liquidVolume('water', 0));
    expect(liquidVolume('water', 4)).toBeLessThan(liquidVolume('water', 8));
  });

  it('Steighöhe in der Kapillare', () => {
    // 150 mm³, r = 0,15 mm, Ethanol, 10 K: 1,1e-3 · 150 · 10 / (π · 0,0225) ≈ 23,3 mm
    expect(capillaryRise(1.1e-3, 150, 0.15, 10)).toBeCloseTo(23.34, 1);
  });
});

describe('Alltag: Fugen und Leitungen', () => {
  it('Brückenfuge: 100 m Stahl, 40 mm bei 20 °C', () => {
    expect(gapWidth(ALPHA.steel, 100, 0.04, 20)).toBeCloseTo(0.04, 12);
    // bei 50 °C: 40 mm − 12e-6 · 100 m · 30 K = 40 mm − 36 mm = 4 mm
    expect(gapWidth(ALPHA.steel, 100, 0.04, 50) * 1000).toBeCloseTo(4, 9);
    expect(gapWidth(ALPHA.steel, 100, 0.04, -20) * 1000).toBeCloseTo(88, 9);
    expect(gapWidth(ALPHA.steel, 30, 0.011, 60)).toBe(0);
  });

  it('Freileitung hängt im Sommer tiefer durch', () => {
    expect(cableSag(200, 3, ALPHA.aluminium, 20)).toBeCloseTo(3, 9);
    expect(cableSag(200, 3, ALPHA.aluminium, 40)).toBeGreaterThan(3);
    expect(cableSag(200, 3, ALPHA.aluminium, -20)).toBeLessThan(3);
  });
});

describe('Bimetall-Thermostat', () => {
  it('Ausbiegung wächst mit ΔT und L², fällt mit der Dicke', () => {
    const y = bimetalDeflection(11e-6, 100, 0.05, 0.001);
    expect(y).toBeCloseTo((3 * 11e-6 * 100 * 0.0025) / 0.004, 12);
    expect(bimetalDeflection(11e-6, 200, 0.05, 0.001)).toBeCloseTo(2 * y, 12);
  });

  it('pendelt um die Solltemperatur', () => {
    let st = { T: 20, on: true };
    const opts = { set: 150, hyst: 12, heat: 9, k: 0.025, env: 20 };
    let max = 0;
    let min = Infinity;
    let switches = 0;
    for (let t = 0; t < 200; t += 0.01) {
      const was = st.on;
      st = thermostatStep(st, 0.01, opts);
      if (st.on !== was) switches++;
      if (t > 60) {
        max = Math.max(max, st.T);
        min = Math.min(min, st.T);
      }
    }
    expect(switches).toBeGreaterThan(3);
    expect(max).toBeLessThan(157);
    expect(min).toBeGreaterThan(143);
  });
});

describe('Übung Wärmeausdehnung', () => {
  it('liest Zahlen und prüft alle Aufgaben', () => {
    expect(parseAnswer('1,2 mm')).toBe(1.2);
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
});
