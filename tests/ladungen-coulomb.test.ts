import { describe, expect, it } from 'vitest';
import {
  BREAKDOWN,
  checkTask,
  coulomb,
  E_CHARGE,
  electricToGravity,
  electroscopeAngle,
  fieldAt,
  fieldLine,
  gravity,
  groundField,
  inducedCharge,
  K,
  M_E,
  M_P,
  makeTask,
  parseAnswer,
  polarization,
  rubCharge,
  scrapLiftRatio,
  strike,
} from '../src/simulations/physik/ladungen-coulomb/model';

describe('Ladungen und Coulomb', () => {
  it('Coulombkraft: doppelter Abstand, ein Viertel der Kraft', () => {
    expect(coulomb(1e-6, 1e-6, 0.1)).toBeCloseTo(0.8988, 3);
    expect(coulomb(1e-6, 1e-6, 0.2) / coulomb(1e-6, 1e-6, 0.1)).toBeCloseTo(0.25, 12);
    expect(coulomb(1e-6, -1e-6, 0.1)).toBeLessThan(0);
  });

  it('Wasserstoffatom: Kraft zwischen Kern und Elektron', () => {
    expect(Math.abs(coulomb(E_CHARGE, -E_CHARGE, 5.29e-11))).toBeCloseTo(8.24e-8, 9);
    expect(K).toBeCloseTo(8.99e9, -7);
  });

  it('Reiben: Glas gegen Seide – Glas positiv; Gummi gegen Wolle – Gummi negativ', () => {
    expect(rubCharge('glass', 'silk', 10).a).toBeGreaterThan(0);
    expect(rubCharge('rubber', 'wool', 10).a).toBeLessThan(0);
    const r = rubCharge('pvc', 'hair', 5);
    expect(r.a + r.b).toBe(0);
  });

  it('Elektroskop schlägt bei beiden Vorzeichen gleich aus', () => {
    expect(electroscopeAngle(4, 16)).toBe(electroscopeAngle(-4, 16));
    expect(electroscopeAngle(100, 16)).toBeCloseTo(Math.PI / 3, 12);
  });
});

describe('Influenz', () => {
  it('getrennte Ladung fällt mit 1/d² und hat das Vorzeichen des Stabs', () => {
    expect(inducedCharge(1, 0.05)).toBeCloseTo(0.8, 12);
    expect(inducedCharge(1, 0.1)).toBeCloseTo(0.2, 12);
    expect(inducedCharge(-1, 0.1)).toBeCloseTo(-0.2, 12);
    expect(inducedCharge(1, 0.01)).toBeCloseTo(0.8, 12);
  });
});

describe('Feld und Feldlinien', () => {
  it('Feld zeigt von der positiven Ladung weg, zur negativen hin', () => {
    const [ex] = fieldAt(1, 0, [{ x: 0, y: 0, q: 1 }]);
    expect(ex).toBeGreaterThan(0);
    const [ex2] = fieldAt(1, 0, [{ x: 0, y: 0, q: -1 }]);
    expect(ex2).toBeLessThan(0);
    // Mitte eines symmetrischen Paars gleicher Ladungen: kein Feld
    const [mx, my] = fieldAt(0, 0, [
      { x: -1, y: 0, q: 1 },
      { x: 1, y: 0, q: 1 },
    ]);
    expect(Math.hypot(mx, my)).toBeCloseTo(0, 12);
  });

  it('eine Feldlinie vom Plus endet am Minus', () => {
    const ch = [
      { x: 0, y: 0, q: 1 },
      { x: 100, y: 0, q: -1 },
    ];
    const pts = fieldLine(10, 1, ch, 1, 1, 2000, { x0: -500, y0: -500, x1: 500, y1: 500 }, 5);
    const [x, y] = pts[pts.length - 1]!;
    expect(Math.hypot(x - 100, y)).toBeLessThan(6);
  });
});

describe('Atom', () => {
  it('elektrische Kraft etwa 2,3 · 10³⁹-mal so groß wie die Gravitation', () => {
    expect(electricToGravity()).toBeGreaterThan(2.2e39);
    expect(electricToGravity()).toBeLessThan(2.35e39);
    // Gravitation im Wasserstoffatom (53 pm) ≈ 3,6 · 10⁻⁴⁷ N
    expect(gravity(M_E, M_P, 53e-12)).toBeCloseTo(3.6e-47, 48);
  });
});

describe('Übung Ladungen', () => {
  it('liest Zahlen und prüft alle Aufgaben', () => {
    expect(parseAnswer('0,45 N')).toBe(0.45);
    expect(parseAnswer('2 µC')).toBe(2);
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

describe('Luftballon und Gewitter', () => {
  it('Schnipsel springen erst nah genug', () => {
    expect(scrapLiftRatio(10, 2)).toBeCloseTo(1, 9);
    expect(scrapLiftRatio(15, 2)).toBeGreaterThan(1);
    expect(scrapLiftRatio(15, 6)).toBeLessThan(1);
    expect(polarization(30, 1)).toBe(1);
    expect(polarization(0, 3)).toBe(0);
  });
  it('Blitzableiter fängt den Blitz, ohne ihn bleibt es bei mittlerem Gewitter ruhig', () => {
    expect(strike(20, 2000, true).target).toBe('stab');
    expect(strike(20, 2000, false).target).toBeNull();
    expect(strike(40, 1500, false).target).toBe('baum');
    expect(groundField(20, 2000)).toBeCloseTo((2 * K * 20) / 4e6, 3);
    expect(BREAKDOWN).toBe(3e6);
  });
  it('neue Übungsarten haben eine gültige Antwort', () => {
    for (let n = 1; n <= 100; n++) {
      const t = makeTask(n);
      if (t.kind === 'balloon' || t.kind === 'storm') expect(checkTask(t, String(t.answer))).toBe(true);
    }
  });
});
