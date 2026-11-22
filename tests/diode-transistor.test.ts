import { describe, expect, it } from 'vitest';
import {
  baseCurrent,
  collectorLimit,
  currentFactor,
  decadeVoltage,
  depletionWidth,
  diodeCircuit,
  diodeCurrent,
  diodeVoltage,
  DIODE_IDS,
  DIODES,
  frequencyOf,
  H_PLANCK,
  LED_IDS,
  ldrResistance,
  luxFromLevel,
  outputSwing,
  photonEnergyEV,
  planckFromLeds,
  rectifierWave,
  rectMean,
  rectOutput,
  rectPeak,
  rippleEstimate,
  rms,
  shockley,
  sourceForDiodeVoltage,
  switchCircuit,
  thermalVoltage,
  thresholdVoltage,
  transistor,
  U_B,
} from '../src/simulations/physik/diode-transistor/model';

describe('Modell: Diode und Transistor – Shockley-Gleichung', () => {
  it('Temperaturspannung U_T = k·T/e ≈ 25,85 mV bei 300 K', () => {
    // 1,380649e-23 · 300 / 1,602176634e-19 = 0,025852 V
    expect(thermalVoltage(300)).toBeCloseTo(0.025852, 6);
    expect(thermalVoltage(300) * 1e3).toBeCloseTo(25.85, 2);
    // proportional zur Temperatur
    expect(thermalVoltage(600) / thermalVoltage(300)).toBeCloseTo(2, 12);
  });

  it('Shockley I = I_S·(e^{U/U_T} − 1): bei U = 0 kein Strom, bei U = U_T·ln 2 genau I_S', () => {
    expect(shockley(0, 1e-13)).toBe(0);
    expect(shockley(thermalVoltage() * Math.LN2, 1e-13)).toBeCloseTo(1e-13, 25);
  });

  it('Siliziumdiode leitet merklich ab ≈ 0,6–0,7 V (Ströme im mA-Bereich)', () => {
    const I06 = diodeCurrent('si', 0.6);
    const I07 = diodeCurrent('si', 0.7);
    // I_S = 1e-13 A: 1,2 mA bei 0,6 V, 57 mA bei 0,7 V
    expect(I06).toBeCloseTo(1.201e-3, 5);
    expect(I07).toBeCloseTo(57.5e-3, 3);
    // bei 0,4 V praktisch noch nichts (unter 1 µA)
    expect(diodeCurrent('si', 0.4)).toBeLessThan(1e-6);
    const Us = thresholdVoltage('si');
    expect(Us).toBeGreaterThan(0.6);
    expect(Us).toBeLessThan(0.7);
    expect(Us).toBeCloseTo(0.6548, 3);
  });

  it('60 mV mehr Spannung geben etwa den 10-fachen Strom (n = 1)', () => {
    const r = diodeCurrent('si', 0.66) / diodeCurrent('si', 0.6);
    // e^(0,06/0,025852) = 10,18
    expect(r).toBeCloseTo(10.18, 2);
    expect(currentFactor(0.06)).toBeCloseTo(10.18, 2);
    // genau zehnfach bei ΔU = U_T · ln 10 ≈ 59,5 mV
    expect(decadeVoltage(1) * 1e3).toBeCloseTo(59.53, 2);
  });

  it('Germanium leitet schon bei etwa 0,3 V', () => {
    expect(thresholdVoltage('ge')).toBeCloseTo(0.2976, 3);
    expect(thresholdVoltage('ge')).toBeLessThan(thresholdVoltage('si'));
  });

  it('Sperrrichtung: I ≈ −I_S', () => {
    for (const d of DIODE_IDS) {
      const Is = DIODES[d].Is;
      expect(diodeCurrent(d, -1) / -Is).toBeCloseTo(1, 6);
      expect(diodeCurrent(d, -5)).toBeLessThan(0);
      expect(diodeCurrent(d, -5)).toBeGreaterThanOrEqual(-Is);
    }
  });

  it('diodeVoltage ist die Umkehrung der Shockley-Gleichung', () => {
    for (const d of DIODE_IDS) {
      for (const I of [1e-6, 1e-3, 0.01, 0.05]) expect(diodeCurrent(d, diodeVoltage(d, I))).toBeCloseTo(I, 10);
    }
  });

  it('Zufallsprüfung: Kennlinie monoton steigend (im Durchlassbereich streng)', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 400; k++) {
      const d = DIODE_IDS[Math.floor(rnd() * DIODE_IDS.length)]!;
      const u1 = -6 + rnd() * 9;
      const u2 = u1 + 1e-3 + rnd() * 0.5;
      // tief in Sperrrichtung ist I = −I_S in Gleitkommazahlen konstant
      expect(diodeCurrent(d, u2)).toBeGreaterThanOrEqual(diodeCurrent(d, u1));
      if (u1 > -0.2) expect(diodeCurrent(d, u2)).toBeGreaterThan(diodeCurrent(d, u1));
    }
  });
});

describe('Modell: Diode mit Vorwiderstand', () => {
  it('Maschenregel U₀ = U_D + I·R ist erfüllt', () => {
    for (const d of DIODE_IDS) {
      for (const U0 of [-5, -0.5, 0, 0.5, 1, 2, 4, 6]) {
        for (const R of [10, 100, 1000]) {
          const op = diodeCircuit(d, U0, R);
          expect(op.Ud + op.I * R).toBeCloseTo(U0, 8);
          expect(op.I).toBeCloseTo(diodeCurrent(d, op.Ud), 10);
        }
      }
    }
  });

  it('Siliziumdiode an 2 V mit 100 Ω: U_D ≈ 0,66 V, I ≈ 13,4 mA', () => {
    const op = diodeCircuit('si', 2, 100);
    expect(op.Ud).toBeCloseTo(0.6625, 3);
    expect(op.I * 1e3).toBeCloseTo(13.38, 1);
  });

  it('Sperrrichtung: fast die ganze Spannung liegt an der Diode', () => {
    const op = diodeCircuit('si', -5, 100);
    expect(op.Ud).toBeCloseTo(-5, 9);
    expect(op.I).toBeCloseTo(-1e-13, 20);
  });

  it('sourceForDiodeVoltage passt zum Arbeitspunkt', () => {
    const U0 = sourceForDiodeVoltage('red', 1.9, 100);
    expect(diodeCircuit('red', U0, 100).Ud).toBeCloseTo(1.9, 8);
  });

  it('Sperrschicht: schmaler in Durchlass-, breiter in Sperrrichtung', () => {
    expect(depletionWidth(0, 0.7)).toBeCloseTo(1, 12);
    expect(depletionWidth(-2.1, 0.7)).toBeCloseTo(2, 12);
    expect(depletionWidth(0.5, 0.7)).toBeLessThan(1);
    expect(depletionWidth(0.7, 0.7)).toBeCloseTo(0.12, 12);
  });
});

describe('Modell: Leuchtdioden', () => {
  it('Photonenenergie E = h·c/λ: 625 nm → 1,98 eV, 470 nm → 2,64 eV', () => {
    expect(photonEnergyEV(625)).toBeCloseTo(1.984, 3);
    expect(photonEnergyEV(470)).toBeCloseTo(2.638, 3);
  });

  it('Schwellspannung der LEDs = h·f/e und steigt von rot nach blau', () => {
    for (const id of LED_IDS) expect(thresholdVoltage(id)).toBeCloseTo(photonEnergyEV(DIODES[id].lambda!), 9);
    expect(thresholdVoltage('red')).toBeLessThan(thresholdVoltage('yel'));
    expect(thresholdVoltage('yel')).toBeLessThan(thresholdVoltage('grn'));
    expect(thresholdVoltage('grn')).toBeLessThan(thresholdVoltage('blu'));
  });

  it('aus den LEDs ergibt sich h = 6,626·10⁻³⁴ J·s', () => {
    expect(frequencyOf(625)).toBeCloseTo(4.797e14, -11);
    const h = planckFromLeds(LED_IDS.map((id) => ({ U: thresholdVoltage(id), f: frequencyOf(DIODES[id].lambda!) })));
    expect(h! / H_PLANCK).toBeCloseTo(1, 9);
  });
});

describe('Modell: Transistor', () => {
  it('B = 100, I_B = 0,1 mA → I_C = 10 mA', () => {
    const op = transistor(0.1e-3, 100, 470);
    expect(op.IC).toBeCloseTo(10e-3, 12);
    expect(op.saturated).toBe(false);
    // U_CE = 9 V − 10 mA · 470 Ω = 4,3 V
    expect(op.UCE).toBeCloseTo(4.3, 10);
  });

  it('Sättigung: I_C begrenzt durch den Lastwiderstand', () => {
    // I_C,max = (9 V − 0,2 V) / 470 Ω = 18,72 mA
    expect(collectorLimit(470) * 1e3).toBeCloseTo(18.72, 2);
    const op = transistor(0.5e-3, 100, 470);
    expect(op.saturated).toBe(true);
    expect(op.IC * 1e3).toBeCloseTo(18.72, 2);
    expect(op.ICideal * 1e3).toBeCloseTo(50, 10);
    expect(op.UCE).toBeCloseTo(0.2, 10);
  });

  it('ohne Basisstrom sperrt der Transistor', () => {
    expect(transistor(0, 100, 470).IC).toBe(0);
    expect(transistor(-1e-3, 100, 470).IC).toBe(0);
    expect(transistor(0, 100, 470).UCE).toBe(U_B);
  });

  it('Basisstrom aus Spannungsquelle: U = I_B·R + U_BE', () => {
    const ib = baseCurrent(9, 4700);
    // etwa (9 − 0,7) / 4,7 kΩ ≈ 1,77 mA
    expect(ib * 1e3).toBeCloseTo(1.78, 1);
    expect(baseCurrent(0, 4700)).toBe(0);
  });

  it('Schalter mit Taster: kleiner Basisstrom schaltet großen Kollektorstrom', () => {
    const off = switchCircuit({ kind: 'key', pressed: false });
    const on = switchCircuit({ kind: 'key', pressed: true });
    expect(off.IC).toBe(0);
    expect(off.lampOn).toBe(false);
    expect(on.saturated).toBe(true);
    expect(on.lampOn).toBe(true);
    expect(on.IC / on.IB).toBeGreaterThan(20);
  });

  it('Dämmerungsschalter: dunkel → Lampe an, hell → Lampe aus', () => {
    expect(ldrResistance(10)).toBeCloseTo(15e3, 6);
    expect(ldrResistance(1000)).toBeLessThan(ldrResistance(1));
    expect(luxFromLevel(0)).toBeCloseTo(0.1, 12);
    expect(luxFromLevel(100)).toBeCloseTo(1000, 9);
    const night = switchCircuit({ kind: 'ldr', lux: 1, R1: 47e3 });
    const day = switchCircuit({ kind: 'ldr', lux: 1000, R1: 47e3 });
    expect(night.lampOn).toBe(true);
    expect(day.lampOn).toBe(false);
    expect(day.IC).toBeLessThan(1e-4);
    // Kollektorstrom fällt monoton, wenn es heller wird
    let last = Infinity;
    for (let h = 0; h <= 100; h += 5) {
      const ic = switchCircuit({ kind: 'ldr', lux: luxFromLevel(h), R1: 47e3 }).IC;
      expect(ic).toBeLessThanOrEqual(last + 1e-12);
      last = ic;
    }
  });

  it('Verstärker: Aussteuerung im linearen Bereich unverzerrt, sonst begrenzt', () => {
    const lin = outputSwing(0.1e-3, 0.04e-3, 100, 470);
    expect(lin.max - lin.min).toBeCloseTo(100 * 0.08e-3, 9);
    const clip = outputSwing(0.17e-3, 0.04e-3, 100, 470);
    expect(clip.max).toBeCloseTo(collectorLimit(470), 12);
    const cut = outputSwing(0.02e-3, 0.04e-3, 100, 470);
    expect(cut.min).toBe(0);
  });
});

describe('Modell: Gleichrichter', () => {
  it('Spitzenwert minus Schwellspannung: Û = 10 V → 9,3 V (Einweg), 8,6 V (Brücke)', () => {
    expect(rectPeak(10, 'half')).toBeCloseTo(9.3, 12);
    expect(rectPeak(10, 'bridge')).toBeCloseTo(8.6, 12);
    expect(rectPeak(1, 'bridge')).toBe(0);
  });

  it('Mittelwert ideal: Û/π (Einweg), 2Û/π (Brücke)', () => {
    expect(rectMean(10, 'half', 0)).toBeCloseTo(10 / Math.PI, 12);
    expect(rectMean(10, 'bridge', 0)).toBeCloseTo(20 / Math.PI, 12);
    // mit U_F = 0,7 V: 2,841 V bzw. 5,029 V
    expect(rectMean(10, 'half')).toBeCloseTo(2.841, 3);
    expect(rectMean(10, 'bridge')).toBeCloseTo(5.029, 3);
  });

  it('Augenblickswerte: Einweg sperrt die negative Halbwelle, Brücke klappt sie um', () => {
    expect(rectOutput(-8, 'half')).toBe(0);
    expect(rectOutput(-8, 'bridge')).toBeCloseTo(6.6, 12);
    expect(rectOutput(8, 'half')).toBeCloseTo(7.3, 12);
  });

  it('Simulierter Verlauf ohne Kondensator stimmt mit Spitzen- und Mittelwert überein', () => {
    for (const kind of ['half', 'bridge'] as const) {
      const w = rectifierWave(10, kind, 0, 1000, { samples: 2000 });
      expect(w.peak).toBeCloseTo(rectPeak(10, kind), 4);
      expect(w.mean).toBeCloseTo(rectMean(10, kind), 3);
      expect(w.min).toBe(0);
    }
  });

  it('Glättungskondensator: Spannung fast konstant, Brummen wie I/(f_B·C)', () => {
    const w = rectifierWave(10, 'bridge', 470e-6, 1000);
    // ΔU ≈ 8,6 V / (1 kΩ · 100 Hz · 470 µF) ≈ 0,18 V
    expect(rippleEstimate(10, 'bridge', 470e-6, 1000)).toBeCloseTo(0.183, 3);
    expect(w.ripple).toBeGreaterThan(0.1);
    expect(w.ripple).toBeLessThan(0.25);
    expect(w.peak).toBeLessThanOrEqual(rectPeak(10, 'bridge') + 1e-9);
    expect(w.mean).toBeGreaterThan(8);
    // Einweg brummt etwa doppelt so stark
    const h = rectifierWave(10, 'half', 470e-6, 1000);
    expect(h.ripple / w.ripple).toBeGreaterThan(1.6);
    expect(h.ripple / w.ripple).toBeLessThan(2.4);
  });

  it('Effektivwert U_eff = Û/√2', () => {
    expect(rms(10)).toBeCloseTo(7.071, 3);
  });
});
