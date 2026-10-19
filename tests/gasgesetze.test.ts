import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  amount,
  celsius,
  equilibrium,
  fitHyperbola,
  fitLine,
  fitOrigin,
  GasBox,
  gaugeRange,
  idealPressure2D,
  invariant,
  isobaric,
  isochoric,
  isothermal,
  kelvin,
  meanSpeed,
  M_N2,
  modelKT,
  noisy,
  P_NORMAL,
  particleCount,
  pressure,
  R,
  rangeFor,
  temperature,
  volume,
  V_MAX,
  V_MIN,
  xIntercept,
} from '../src/simulations/physik/gasgesetze/model';

describe('Modell: Gasgesetze – ideales Gas', () => {
  it('molares Volumen: n = 1 mol, T = 273,15 K, p = 101 325 Pa → V ≈ 22,41 L', () => {
    expect(volume(1, 273.15, P_NORMAL)).toBeCloseTo(22.414, 3);
  });

  it('Gasgleichung in allen Richtungen konsistent (kPa · L = J)', () => {
    const p = pressure(2, 300, 40);
    expect(p).toBeCloseTo((2 * R * 300) / 40, 10);
    expect(p * 40).toBeCloseTo(2 * R * 300, 9);
    expect(temperature(2, p, 40)).toBeCloseTo(300, 10);
    expect(amount(p, 40, 300)).toBeCloseTo(2, 12);
  });

  it('0 K ↔ −273,15 °C, 0 °C ↔ 273,15 K, 100 °C ↔ 373,15 K', () => {
    expect(kelvin(-273.15)).toBe(0);
    expect(celsius(0)).toBe(-273.15);
    expect(kelvin(0)).toBe(273.15);
    expect(kelvin(100)).toBeCloseTo(373.15, 12);
  });

  it('isotherm: V halbieren → p verdoppelt (Boyle-Mariotte)', () => {
    const s = equilibrium('isotherm', 1, 273.15, 22.4, 0);
    const t = isothermal(s, 11.2);
    expect(t.p / s.p).toBeCloseTo(2, 12);
    expect(t.p * t.V).toBeCloseTo(s.p * s.V, 9);
    expect(t.p).toBeCloseTo(pressure(1, 273.15, 11.2), 9);
  });

  it('isobar: 0 °C → 100 °C, V wächst um den Faktor 373,15/273,15 (Gay-Lussac)', () => {
    const s = equilibrium('isobar', 1, 273.15, 0, P_NORMAL);
    expect(s.stop).toBe(0);
    expect(s.V).toBeCloseTo(22.414, 3);
    const t = isobaric(s, 373.15);
    expect(t.V / s.V).toBeCloseTo(373.15 / 273.15, 12);
    expect(t.V).toBeCloseTo(30.62, 2);
    expect(equilibrium('isobar', 1, 373.15, 0, P_NORMAL).V).toBeCloseTo(t.V, 9);
  });

  it('isochor: p/T bleibt konstant (Amontons)', () => {
    const s = equilibrium('isochor', 1, 273.15, 22.414, 0);
    expect(s.p).toBeCloseTo(P_NORMAL, 2);
    for (const T of [223.15, 300, 373.15, 523.15]) {
      const t = isochoric(s, T);
      expect(t.p / t.T).toBeCloseTo(s.p / s.T, 12);
      expect(invariant('isochor', t)).toBeCloseTo(invariant('isochor', s), 12);
    }
    expect(isochoric(s, 373.15).p).toBeCloseTo(138.4, 1);
  });

  it('isobar am Anschlag: Kolben bleibt bei V_MAX bzw. V_MIN, Druck folgt aus V', () => {
    const hi = equilibrium('isobar', 2, 523.15, 0, 50);
    expect(hi.stop).toBe(1);
    expect(hi.V).toBe(V_MAX);
    expect(hi.p).toBeCloseTo(pressure(2, 523.15, V_MAX), 9);
    expect(hi.p).toBeGreaterThan(50);
    const lo = equilibrium('isobar', 0.5, 223.15, 0, 300);
    expect(lo.stop).toBe(-1);
    expect(lo.V).toBe(V_MIN);
    expect(lo.p).toBeLessThan(300);
  });

  it('konstante Ausdrücke der drei Gesetze', () => {
    const s = { p: 100, V: 20, T: 250 };
    expect(invariant('isotherm', s)).toBe(2000);
    expect(invariant('isobar', s)).toBeCloseTo(0.08, 12);
    expect(invariant('isochor', s)).toBeCloseTo(0.4, 12);
  });

  it('Messbereich des Manometers: fasst den größten Druck im Versuch, ändert sich nicht beim Durchführen', () => {
    expect(rangeFor(90)).toBe(100);
    expect(rangeFor(227)).toBe(250);
    expect(rangeFor(5000)).toBe(1000);
    // isotherm, 1 mol, 0 °C: höchster Druck bei V_MIN = 10 L → 227 kPa
    const r = gaugeRange('isotherm', 1, 273.15, 22.4, 0);
    expect(r).toBe(250);
    expect(gaugeRange('isotherm', 1, 273.15, 11, 0)).toBe(r);
    // isochor: höchster Druck bei 250 °C
    expect(gaugeRange('isochor', 1, 273.15, 22.4, 0)).toBeGreaterThanOrEqual(pressure(1, 523.15, 22.4));
    // isobar: Normdruck → Bereich über p
    expect(gaugeRange('isobar', 1, 273.15, 0, P_NORMAL)).toBe(150);
  });
});

describe('Modell: Gasgesetze – Auswertung', () => {
  it('Ausgleichsgerade V(ϑ) einer exakten Isobare schneidet die ϑ-Achse bei −273,15 °C', () => {
    const pts = [-50, 0, 50, 100, 150, 200, 250].map((th) => [th, volume(1, kelvin(th), P_NORMAL)] as const);
    const fit = fitLine(pts)!;
    expect(xIntercept(fit)).toBeCloseTo(-273.15, 9);
    expect(fit.m).toBeCloseTo(R / P_NORMAL, 12);
  });

  it('mit 1 % Messrauschen liegt der extrapolierte Nullpunkt nahe −273 °C', () => {
    const rand = seededRandom(5);
    const pts = [-50, 0, 50, 100, 150, 200, 250].map((th) => [th, noisy(pressure(1, kelvin(th), 22.4), 0.01, rand)] as const);
    const t0 = xIntercept(fitLine(pts)!);
    expect(t0).toBeGreaterThan(-300);
    expect(t0).toBeLessThan(-250);
  });

  it('Linearisierung: p über 1/V ist eine Ursprungsgerade mit Steigung n · R · T', () => {
    const pts = [10, 15, 20, 30, 40, 50].map((V) => ({ p: pressure(1, 273.15, V), V }));
    expect(fitHyperbola(pts)).toBeCloseTo(R * 273.15, 9);
    expect(fitOrigin([[1, 2], [2, 4]])).toBe(2);
    expect(fitOrigin([])).toBeNull();
  });

  it('Grenzfälle der Ausgleichsgeraden', () => {
    expect(fitLine([[1, 1]])).toBeNull();
    expect(fitLine([[2, 1], [2, 3]])).toBeNull();
    expect(noisy(5, 0, Math.random)).toBe(5);
  });
});

describe('Modell: Gasgesetze – Teilchenbild', () => {
  it('Teilchenzahl im Bild proportional zur Stoffmenge', () => {
    expect(particleCount(1)).toBe(24);
    expect(particleCount(2)).toBe(2 * particleCount(1));
    expect(modelKT(2 * 273.15)).toBeCloseTo(2 * modelKT(273.15), 12);
  });

  it('mittlere Geschwindigkeit von Stickstoff bei 0 °C ≈ 454 m/s', () => {
    expect(meanSpeed(273.15, M_N2)).toBeCloseTo(454, 0);
  });

  /** Druck aus den Wandstößen über eine längere Zeit messen. */
  function measure(N: number, T: number, height: number): { measured: number; ideal: number } {
    const box = new GasBox(64, 12, height, 0.27, seededRandom(42));
    const kT = modelKT(T);
    box.setCount(N, kT);
    for (let i = 0; i < 400; i++) box.step(1 / 240, { kT });
    box.resetMeasurement();
    for (let i = 0; i < 240 * 60; i++) box.step(1 / 240, { kT });
    return { measured: box.measuredPressure(), ideal: idealPressure2D(N, kT, box.area()) };
  }

  it('Druck aus den Teilchenstößen stimmt mit p = N · k · T / A überein (±6 %)', () => {
    const { measured, ideal } = measure(24, 273.15, 10);
    expect(measured / ideal).toBeGreaterThan(0.94);
    expect(measured / ideal).toBeLessThan(1.06);
  });

  it('doppelte Teilchenzahl → doppelter Druck; halbe Fläche → doppelter Druck', () => {
    const a = measure(24, 273.15, 10).measured;
    const b = measure(48, 273.15, 10).measured;
    const c = measure(24, 273.15, 5.27).measured;
    expect(b / a).toBeGreaterThan(1.85);
    expect(b / a).toBeLessThan(2.15);
    expect(c / a).toBeGreaterThan(1.8);
    expect(c / a).toBeLessThan(2.2);
  });

  it('Thermostat hält die mittlere Bewegungsenergie bei N · k · T; Teilchen bleiben im Zylinder', () => {
    const box = new GasBox(64, 12, 8, 0.27, seededRandom(3));
    const kT = modelKT(373.15);
    box.setCount(30, modelKT(273.15));
    for (let i = 0; i < 240 * 10; i++) box.step(1 / 240, { kT, pistonSpeed: i < 240 ? -1 : 0 });
    expect(box.kinetic() / (30 * kT)).toBeGreaterThan(0.75);
    expect(box.kinetic() / (30 * kT)).toBeLessThan(1.25);
    for (let i = 0; i < box.count; i++) {
      expect(box.y[i]!).toBeLessThanOrEqual(box.height - box.radius + 1e-9);
      expect(box.y[i]!).toBeGreaterThanOrEqual(box.radius - 1e-9);
      expect(box.x[i]!).toBeGreaterThanOrEqual(box.radius - 1e-9);
    }
    box.squeeze(4);
    for (let i = 0; i < box.count; i++) expect(box.y[i]!).toBeLessThanOrEqual(4 - box.radius + 1e-9);
  });
});
