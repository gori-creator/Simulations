import { describe, expect, it } from 'vitest';
import {
  checkTask,
  cyclotron,
  deflection,
  E,
  fadenRadius,
  floatVoltage,
  hallVoltage,
  helix,
  HELMHOLTZ_K,
  makeTask,
  ME,
  millikanCharge,
  MP,
  SAMPLES,
  screenSpot,
  specificCharge,
  spectrometerRadius,
  speedAfter,
} from '../src/simulations/physik/teilchen-felder/model';

describe('Teilchen in Feldern', () => {
  it('Elektron nach 1 kV: etwa 1,9 · 10⁷ m/s', () => {
    expect(speedAfter(1000)).toBeCloseTo(1.875e7, -5);
  });

  it('Ablenkung: doppelte Spannung, doppelte Ablenkung', () => {
    const v = speedAfter(1000);
    const a = deflection(100, 0.02, 0.05, v);
    const b = deflection(200, 0.02, 0.05, v);
    expect(b.yEnd / a.yEnd).toBeCloseTo(2, 10);
    // y = Ud l² / (4 d Ua) unabhängig von q/m
    expect(a.yEnd).toBeCloseTo((100 * 0.05 ** 2) / (4 * 0.02 * 1000), 10);
  });

  it('Millikan: Ladung als Vielfaches von e', () => {
    const U = floatVoltage(1e-6, 875, 3, 0.005);
    expect(millikanCharge(1e-6, 875, U, 0.005) / E).toBeCloseTo(3, 10);
  });

  it('Zyklotron: Frequenz unabhängig von der Geschwindigkeit', () => {
    const a = cyclotron(1, 1e6);
    const b = cyclotron(1, 2e6);
    expect(a.f).toBeCloseTo(b.f, 6);
    expect(b.r / a.r).toBeCloseTo(2, 10);
    expect(a.f).toBeCloseTo((E * 1) / (2 * Math.PI * MP), 3);
  });

  it('Hall-Spannung in Kupfer ist winzig', () => {
    // n ≈ 8,5 · 10²⁸ /m³, d = 0,1 mm, B = 1 T, I = 5 A
    expect(hallVoltage(1, 5, 8.5e28, 1e-4)).toBeCloseTo(3.67e-6, 7);
  });
});

describe('Massenspektrometer und Schraubenbahn', () => {
  it('schwerere Isotope fliegen weiter', () => {
    const v = 1e5;
    expect(spectrometerRadius(37, v, 0.5)).toBeGreaterThan(spectrometerRadius(35, v, 0.5));
    expect(spectrometerRadius(37, v, 0.5) / spectrometerRadius(35, v, 0.5)).toBeCloseTo(37 / 35, 9);
    // doppeltes Feld: halber Radius
    expect(spectrometerRadius(12, v, 1)).toBeCloseTo(spectrometerRadius(12, v, 0.5) / 2, 12);
  });
  it('Anteile jeder Probe ergeben zusammen etwa 100 %', () => {
    for (const smp of Object.values(SAMPLES)) {
      const sum = smp.isotopes.reduce((a, i) => a + i.share, 0);
      expect(sum).toBeGreaterThan(0.99);
      expect(sum).toBeLessThan(1.01);
    }
  });
  it('Schraubenbahn: senkrecht ein Kreis, parallel eine Gerade', () => {
    const perp = helix(1e7, 90, 1);
    expect(perp.pitch).toBeCloseTo(0, 12);
    expect(perp.r).toBeCloseTo((ME * 1e7) / (E * 1), 12);
    const par = helix(1e7, 0, 1);
    expect(par.r).toBeCloseTo(0, 12);
    expect(par.pitch).toBeCloseTo(1e7 * par.T, 9);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(2)).toEqual(makeTask(2));
    expect(new Set(Array.from({ length: 16 }, (_, i) => makeTask(i + 1).kind)).size).toBe(8);
  });
  it('erkennt die hinterlegte Antwort', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      const v = t.tol === 0 ? String(t.answer) : String(Math.round(t.answer * 1000) / 1000).replace('.', ',');
      expect(checkTask(t, v)).toBe(true);
      expect(checkTask(t, String(t.answer * 3 + 1))).toBe(false);
      if (t.choices) expect(t.answer).toBeLessThanOrEqual(t.choices.length);
    }
    expect(checkTask(makeTask(1), 'V')).toBeNull();
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});

describe('Fadenstrahlrohr und Oszilloskop', () => {
  it('aus U, B und r folgt wieder e/m', () => {
    const B = HELMHOLTZ_K * 1.5;
    const r = fadenRadius(200, B);
    expect(r).toBeGreaterThan(0.03);
    expect(r).toBeLessThan(0.06);
    expect(specificCharge(200, B, r)).toBeCloseTo(E / ME, -8);
    expect(HELMHOLTZ_K * 1000).toBeCloseTo(0.78, 2);
  });
  it('größere Spannung, größerer Kreis; stärkeres Feld, kleinerer Kreis', () => {
    expect(fadenRadius(300, 1e-3)).toBeGreaterThan(fadenRadius(200, 1e-3));
    expect(fadenRadius(200, 2e-3)).toBeCloseTo(fadenRadius(200, 1e-3) / 2, 12);
  });
  it('Leuchtfleck: Sägezahn läuft von links nach rechts, Lissajous 1:1 mit 90° ist ein Kreis', () => {
    expect(screenSpot(0, true, 1, 0, 1)[0]).toBeCloseTo(-1, 9);
    expect(screenSpot(0.5, true, 1, 0, 1)[0]).toBeCloseTo(0, 9);
    for (const t of [0.1, 0.37, 0.8]) {
      const [x, y] = screenSpot(t, false, 1, 90, 1);
      expect(x * x + y * y).toBeCloseTo(1, 9);
    }
  });
  it('neue Übungsarten haben eine gültige Antwort', () => {
    for (let n = 1; n <= 80; n++) {
      const t = makeTask(n);
      if (t.kind === 'em' || t.kind === 'circle') expect(checkTask(t, String(Math.round(t.answer * 1000) / 1000).replace('.', ','))).toBe(true);
    }
  });
});
