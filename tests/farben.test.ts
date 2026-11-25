import { describe, expect, it } from 'vitest';
import { additiveMix, colorName, filterPasses, prismDeviation, refractiveIndex, subtractiveMix } from '../src/simulations/physik/farben/model';

describe('Farben', () => {
  it('Blau wird stärker gebrochen als Rot (Dispersion)', () => {
    expect(refractiveIndex(400)).toBeGreaterThan(refractiveIndex(700));
    const apex = (60 * Math.PI) / 180;
    const a = (50 * Math.PI) / 180;
    const dBlue = prismDeviation(refractiveIndex(400), apex, a);
    const dRed = prismDeviation(refractiveIndex(700), apex, a);
    expect(dBlue).toBeGreaterThan(dRed);
    // Ablenkung bei n ≈ 1,51 und 60° um 38–40°
    expect((dRed * 180) / Math.PI).toBeGreaterThan(36);
    expect((dBlue * 180) / Math.PI).toBeLessThan(44);
  });

  it('additive Mischung: Rot + Grün = Gelb, alle drei = Weiß', () => {
    expect(colorName(additiveMix(1, 1, 0))).toBe('yellow');
    expect(colorName(additiveMix(1, 0, 1))).toBe('magenta');
    expect(colorName(additiveMix(0, 1, 1))).toBe('cyan');
    expect(colorName(additiveMix(1, 1, 1))).toBe('white');
    expect(colorName(additiveMix(0, 0, 0))).toBe('black');
    expect(colorName(additiveMix(1, 0.5, 0))).toBe('orange');
  });

  it('subtraktive Mischung: Cyan + Gelb = Grün, alle drei = Schwarz', () => {
    expect(colorName(subtractiveMix(1, 0, 1))).toBe('green');
    expect(colorName(subtractiveMix(0, 1, 1))).toBe('red');
    expect(colorName(subtractiveMix(1, 1, 0))).toBe('blue');
    expect(colorName(subtractiveMix(1, 1, 1))).toBe('black');
    expect(colorName(subtractiveMix(0, 0, 0))).toBe('white');
  });

  it('Filter lassen nur ihre Farbe durch', () => {
    expect(filterPasses('red', 650)).toBe(true);
    expect(filterPasses('red', 450)).toBe(false);
    expect(filterPasses('yellow', 530)).toBe(true);
    expect(filterPasses('yellow', 450)).toBe(false);
    expect(filterPasses('cyan', 650)).toBe(false);
  });
});
