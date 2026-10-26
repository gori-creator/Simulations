import { describe, expect, it } from 'vitest';
import {
  arrayFactor,
  gratingConstant,
  intensity,
  intensityAt,
  maxAngle,
  maxOrder,
  screenPosition,
  slitFactor,
  spacingSmallAngle,
  wavelengthFromMeasurement,
  wavelengthToRgb,
  SLIT_RATIO,
} from '../src/simulations/physik/doppelspalt/model';

const deg = (r: number) => (r * 180) / Math.PI;

describe('Modell: Doppelspalt und Gitter', () => {
  it('Doppelspalt λ = 650 nm, g = 0,1 mm, a = 2 m → Abstand der Maxima 13 mm', () => {
    expect(spacingSmallAngle(650, 2, 0.1e-3) * 1000).toBeCloseTo(13, 9);
    const x1 = screenPosition(maxAngle(1, 650, 0.1e-3)!, 2);
    expect(x1 * 1000).toBeCloseTo(13, 2);
    const x2 = screenPosition(maxAngle(2, 650, 0.1e-3)!, 2);
    expect((x2 - x1) * 1000).toBeCloseTo(13, 2);
  });

  it('Gitter 500 Striche/mm (g = 2 µm), λ = 500 nm → α₁ ≈ 14,48°, höchste Ordnung 3', () => {
    const g = gratingConstant(500);
    expect(g).toBeCloseTo(2e-6, 15);
    expect(deg(maxAngle(1, 500, g)!)).toBeCloseTo(14.48, 2);
    expect(deg(maxAngle(2, 500, g)!)).toBeCloseTo(30, 9);
    expect(deg(maxAngle(3, 500, g)!)).toBeCloseTo(48.59, 2);
    expect(maxAngle(4, 500, g)).toBeNull(); // läge bei 90°
    expect(maxOrder(500, g)).toBe(3);
    expect(maxOrder(650, g)).toBe(3);
    expect(maxOrder(400, g)).toBe(4);
  });

  it('Hauptmaxima haben die volle Intensität, dazwischen N − 1 Nullstellen', () => {
    const g = 0.1e-3;
    const a1 = maxAngle(1, 650, g)!;
    expect(intensity(0, 2, 650, g)).toBeCloseTo(1, 12);
    // Doppelspalt: Minimum bei Δs = λ/2
    expect(intensity(Math.asin(0.5 * 650e-9 / g), 2, 650, g)).toBeCloseTo(0, 9);
    // Gitterfaktor in den Hauptmaxima = 1, Nullstellen bei φ = 2π/N
    expect(arrayFactor(5, 2 * Math.PI)).toBeCloseTo(1, 9);
    expect(arrayFactor(5, (2 * Math.PI) / 5)).toBeCloseTo(0, 12);
    // mehr Spalte: schärfere Maxima (bei 1/4 Ordnung kleiner)
    const q = Math.asin(0.25 * 650e-9 / g);
    expect(intensity(q, 10, 650, g)).toBeLessThan(intensity(q, 2, 650, g));
    // Einzelspalt-Hülle dämpft höhere Ordnungen
    expect(intensity(a1, 2, 650, g)).toBeLessThan(1);
    expect(intensity(a1, 2, 650, g)).toBeGreaterThan(0.85);
    expect(slitFactor(2 * Math.PI)).toBeCloseTo(0, 12);
  });

  it('Messung am Schirm ergibt die Wellenlänge zurück', () => {
    const g = gratingConstant(500);
    const x = screenPosition(maxAngle(1, 532, g)!, 1.2);
    expect(wavelengthFromMeasurement(x, 1.2, g)).toBeCloseTo(532, 9);
    expect(intensityAt(0, 2, 2, 650, 1e-4)).toBeCloseTo(1, 12);
  });

  it('Farben: rot bei 650 nm, grün bei 532 nm', () => {
    expect(wavelengthToRgb(650)[0]).toBe(255);
    const gr = wavelengthToRgb(532);
    expect(gr[1]).toBeGreaterThan(gr[0]);
  });

  it('Minima beim Doppelspalt bei Δs = (k + ½) · λ (Aufgabe 6: 6,5 mm)', () => {
    const g = 0.1e-3;
    for (const k of [0, 1, 2, 5]) {
      const al = Math.asin(((k + 0.5) * 650e-9) / g);
      expect(intensity(al, 2, 650, g)).toBeCloseTo(0, 9);
    }
    // erstes Minimum am Schirm in 2 m Abstand
    const x = screenPosition(Math.asin((0.5 * 650e-9) / g), 2);
    expect(x * 1000).toBeCloseTo(6.5, 3);
    expect(intensityAt(6.5e-3, 2, 2, 650, g)).toBeLessThan(1e-6);
  });

  it('Fehlende Ordnungen: wegen b = g/6 ist k = 6 dunkel', () => {
    expect(SLIT_RATIO).toBeCloseTo(1 / 6, 12);
    const g = gratingConstant(50);
    const a6 = maxAngle(6, 400, g)!;
    expect(intensity(a6, 24, 400, g)).toBeCloseTo(0, 9);
    expect(intensity(maxAngle(5, 400, g)!, 24, 400, g)).toBeGreaterThan(0.01);
  });

  it('Sonderfälle: λ ≥ g → nur 0. Ordnung; k · λ = g genau bei 90° zählt nicht', () => {
    expect(maxOrder(700, 500e-9)).toBe(0);
    expect(maxAngle(1, 700, 500e-9)).toBeNull();
    expect(maxOrder(500, 500e-9)).toBe(0); // k = 1 läge bei 90°
    expect(maxAngle(0, 700, 500e-9)).toBe(0);
    expect(maxOrder(400, gratingConstant(50))).toBe(49);
  });

  it('Reglergrenzen: größter Schirmort x₁ bleibt im Bereich der Messmarke (≤ 5000 mm)', () => {
    let most = 0;
    for (let gl = 50; gl <= 1000; gl += 10)
      for (let lam = 400; lam <= 700; lam += 10) {
        const al = maxAngle(1, lam, gratingConstant(gl));
        if (al !== null) most = Math.max(most, screenPosition(al, 5));
      }
    expect(most).toBeCloseTo(5 * Math.tan(Math.asin(0.7)), 9); // 1000/mm, 700 nm, a = 5 m
    expect(most * 1000).toBeLessThan(5000);
    // Doppelspalt-Grenzen: g = 1 mm, λ = 400 nm, a = 0,2 m → Δx = 0,08 mm
    expect(spacingSmallAngle(400, 0.2, 1e-3) * 1000).toBeCloseTo(0.08, 12);
  });

  it('Aufgabe 7: Gitter 500/mm, x₁ = 27,6 cm bei a = 1 m → λ ≈ 532 nm; Näherung 552 nm', () => {
    const g = gratingConstant(500);
    expect(wavelengthFromMeasurement(0.276, 1, g)).toBeCloseTo(532.1, 1);
    expect(((g * 0.276) / 1) * 1e9).toBeCloseTo(552, 9);
    expect(screenPosition(maxAngle(1, 532, g)!, 1) * 100).toBeCloseTo(27.59, 2);
    // Aufgabe 3/4: x₂ = tan 30° · 1 m, x₃ ≈ 1,13 m
    expect(screenPosition(maxAngle(2, 500, g)!, 1) * 100).toBeCloseTo(57.74, 2);
    expect(screenPosition(maxAngle(3, 500, g)!, 1)).toBeCloseTo(1.134, 3);
  });

  it('Einzelspalt (b = g/6 = 16,7 µm): erstes Minimum bei x ≈ 78,1 mm', () => {
    const b = 0.1e-3 * SLIT_RATIO;
    expect(b * 1e6).toBeCloseTo(16.67, 2);
    const x0 = screenPosition(Math.asin(650e-9 / b), 2);
    expect(x0 * 1000).toBeCloseTo(78.06, 1);
    expect(intensity(Math.asin(650e-9 / b), 1, 650, 0.1e-3)).toBeCloseTo(0, 9);
  });
});
