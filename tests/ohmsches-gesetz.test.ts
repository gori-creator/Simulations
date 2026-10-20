import { describe, expect, it } from 'vitest';
import {
  AMP_RANGES,
  autoRange,
  colorBands,
  crossSection,
  currentAt,
  fitThroughOrigin,
  glowOf,
  I_LIMIT,
  LAMP,
  lampCurrent,
  lampResistance,
  lampTemperature,
  MYSTERY,
  ohmicResistance,
  operatingPoint,
  R_COLD,
  RHO_KONSTANTAN,
  ROOM_T,
  VOLT_RANGES,
  wireResistance,
} from '../src/simulations/physik/ohmsches-gesetz/model';

describe('Modell: Ohmsches Gesetz', () => {
  it('rechnet mit I = U / R für einen Festwiderstand', () => {
    const op = operatingPoint({ kind: 'res', R: 47 }, 6);
    expect(op.I).toBeCloseTo(6 / 47, 12);
    expect(op.R).toBeCloseTo(47, 9);
    expect(op.limited).toBe(false);
    // doppelte Spannung, doppelte Stromstärke
    expect(currentAt({ kind: 'res', R: 47 }, 12)).toBeCloseTo(2 * op.I, 12);
    expect(operatingPoint({ kind: 'res', R: 47 }, 0).I).toBe(0);
  });

  it('berechnet den Widerstand eines Drahtes mit R = ρ · l / A', () => {
    expect(RHO_KONSTANTAN).toBeCloseTo(0.49, 9);
    expect(wireResistance(1, 0.1)).toBeCloseTo(4.9, 12);
    expect(wireResistance(2, 0.1)).toBeCloseTo(2 * wireResistance(1, 0.1), 12);
    expect(wireResistance(1, 0.2)).toBeCloseTo(wireResistance(1, 0.1) / 2, 12);
    expect(crossSection(0.5)).toBeCloseTo(0.19635, 4);
    expect(ohmicResistance({ kind: 'wire', l: 0.5, A: 0.25 })).toBeCloseTo(0.98, 12);
    expect(ohmicResistance({ kind: 'lamp' })).toBeNull();
  });

  it('begrenzt die Stromstärke des Netzgeräts auf 2 A', () => {
    const op = operatingPoint({ kind: 'wire', l: 1, A: 0.1 }, 12);
    expect(op.limited).toBe(true);
    expect(op.I).toBeCloseTo(I_LIMIT, 9);
    expect(op.U).toBeCloseTo(I_LIMIT * 4.9, 6);
    // Der Messpunkt liegt trotzdem auf der Ursprungsgeraden
    expect(op.U / op.I).toBeCloseTo(4.9, 6);
    expect(operatingPoint({ kind: 'wire', l: 1, A: 0.1 }, 5).limited).toBe(false);
  });

  it('kennt die unbekannten Widerstände', () => {
    for (const id of ['A', 'B', 'C'] as const) {
      const op = operatingPoint({ kind: 'mys', mystery: id }, 10);
      expect(op.R).toBeCloseTo(MYSTERY[id], 9);
    }
  });

  it('beschreibt die gekrümmte Kennlinie der Glühlampe', () => {
    expect(lampResistance(ROOM_T)).toBeCloseTo(R_COLD, 12);
    expect(R_COLD).toBeGreaterThan(2);
    expect(R_COLD).toBeLessThan(6);
    // Nennbetrieb: 12 V, 0,25 A, Wendel ≈ 2700 K
    expect(lampCurrent(LAMP.U)).toBeCloseTo(LAMP.I, 6);
    expect(lampTemperature(LAMP.U)).toBeCloseTo(LAMP.T, 3);
    // I wächst mit U, aber langsamer als proportional: R = U / I steigt
    let lastI = 0;
    let lastR = 0;
    for (let U = 0.5; U <= 12; U += 0.5) {
      const I = lampCurrent(U);
      expect(I).toBeGreaterThan(lastI);
      expect(U / I).toBeGreaterThan(lastR);
      lastI = I;
      lastR = U / I;
    }
    expect(lampCurrent(6)).toBeGreaterThan(lampCurrent(12) / 2);
    expect(lampTemperature(0)).toBe(ROOM_T);
    // Bei kleiner Spannung glüht die Wendel noch nicht sichtbar
    expect(glowOf(lampTemperature(0.5))).toBe(0);
    expect(glowOf(lampTemperature(12))).toBeCloseTo(1, 3);
    expect(operatingPoint({ kind: 'lamp' }, 12).limited).toBe(false);
  });

  it('wählt den Messbereich automatisch mit Hysterese', () => {
    expect(autoRange(0.128, AMP_RANGES, 1)).toBe(0.3);
    expect(autoRange(0.31, AMP_RANGES, 0.3)).toBe(1);
    expect(autoRange(0.28, AMP_RANGES, 1)).toBe(1);
    expect(autoRange(0.25, AMP_RANGES, 1)).toBe(0.3);
    expect(autoRange(6, VOLT_RANGES, 3)).toBe(10);
    expect(autoRange(12, VOLT_RANGES, 10)).toBe(30);
    expect(autoRange(99, VOLT_RANGES, 30)).toBe(30);
    expect(autoRange(0, VOLT_RANGES, 30)).toBe(1);
  });

  it('bestimmt die Steigung der Ausgleichsgeraden durch den Ursprung', () => {
    expect(fitThroughOrigin([])).toBeNull();
    expect(fitThroughOrigin([{ x: 0, y: 0 }])).toBeNull();
    expect(fitThroughOrigin([
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ])).toBeCloseTo(2, 12);
    // Messpunkte eines Widerstands: Steigung 1/R
    const pts = [2, 4, 6, 8].map((U) => ({ x: U, y: U / 82 }));
    expect(1 / fitThroughOrigin(pts)!).toBeCloseTo(82, 9);
  });

  it('kodiert Widerstände mit fünf Farbringen', () => {
    expect(colorBands(47)).toEqual([4, 7, 0, -1]);
    expect(colorBands(10)).toEqual([1, 0, 0, -1]);
    expect(colorBands(150)).toEqual([1, 5, 0, 0]);
    expect(colorBands(200)).toEqual([2, 0, 0, 0]);
    expect(colorBands(123)).toEqual([1, 2, 3, 0]);
  });

  it('liefert die Werte der Aufgaben im Lernmaterial', () => {
    // A1: Widerstand B bei 8 V → I ≈ 0,098 A, R = 82 Ω
    const a1 = operatingPoint({ kind: 'mys', mystery: 'B' }, 8);
    expect(a1.I).toBeCloseTo(0.0976, 4);
    expect(a1.R).toBeCloseTo(82, 9);
    // A2: 6 V an 100 Ω → 60 mA
    expect(currentAt({ kind: 'res', R: 100 }, 6)).toBeCloseTo(0.06, 12);
    // A3: 47 Ω · 0,2 A = 9,4 V
    expect(currentAt({ kind: 'res', R: 47 }, 9.4)).toBeCloseTo(0.2, 12);
    // A4: Glühlampe bei 2 V ≈ 0,110 A und ≈ 18 Ω, bei 12 V 0,25 A und 48 Ω
    expect(lampCurrent(2)).toBeCloseTo(0.11, 2);
    expect(2 / lampCurrent(2)).toBeGreaterThan(17.5);
    expect(2 / lampCurrent(2)).toBeLessThan(18.5);
    expect(12 / lampCurrent(12)).toBeCloseTo(48, 4);
    // Wendel bei 12 V über 2000 °C
    expect(lampTemperature(12) - 273).toBeGreaterThan(2000);
    // A5: 2 m, 0,2 mm² → wieder 4,9 Ω; bei 4 V fließen 0,816 A ohne Begrenzung
    expect(wireResistance(2, 0.2)).toBeCloseTo(4.9, 12);
    const a5 = operatingPoint({ kind: 'wire', l: 2, A: 0.2 }, 4);
    expect(a5.limited).toBe(false);
    expect(a5.I).toBeCloseTo(0.816, 3);
    // A6: 12 V am Draht 1 m / 0,1 mm² → 2,4 A > 2 A, Spannung sinkt auf 9,8 V
    expect(currentAt({ kind: 'wire', l: 1, A: 0.1 }, 12)).toBeCloseTo(2.449, 3);
    expect(operatingPoint({ kind: 'wire', l: 1, A: 0.1 }, 12).U).toBeCloseTo(9.8, 6);
  });

  it('behandelt Sonderfälle und Reglergrenzen', () => {
    // U = 0: kein Strom, R bleibt der Bauteilwert (keine Division durch 0)
    const zero = operatingPoint({ kind: 'res', R: 200 }, 0);
    expect(zero.I).toBe(0);
    expect(zero.R).toBe(200);
    expect(operatingPoint({ kind: 'lamp' }, 0).R).toBeCloseTo(R_COLD, 12);
    // negative Spannung (Netzgerät nur 0 … 12 V) wird auf 0 begrenzt
    expect(operatingPoint({ kind: 'res', R: 47 }, -3).U).toBe(0);
    // kleinster Draht: 0,49 · 0,1 / 0,5 = 0,098 Ω → Begrenzung schon bei 0,196 V
    const tiny = operatingPoint({ kind: 'wire', l: 0.1, A: 0.5 }, 12);
    expect(tiny.limited).toBe(true);
    expect(tiny.U).toBeCloseTo(0.196, 6);
    // größte Stromstärke ohne Begrenzung: 12 V an 10 Ω = 1,2 A
    const big = operatingPoint({ kind: 'res', R: 10 }, 12);
    expect(big.limited).toBe(false);
    expect(big.I).toBeCloseTo(1.2, 12);
    // Messbereiche reichen: 1,2 A → 3 A, 2 A → 3 A, 12 V → 30 V
    expect(autoRange(1.2, AMP_RANGES, 0.1)).toBe(3);
    expect(autoRange(2, AMP_RANGES, 0.1)).toBe(3);
    // 150 Ω bei 2 V: 13,3 mA im Bereich 100 mA
    expect(autoRange(currentAt({ kind: 'res', R: 150 }, 2), AMP_RANGES, 1)).toBe(0.1);
  });
});
