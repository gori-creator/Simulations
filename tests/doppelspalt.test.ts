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
});
