import { describe, expect, it } from 'vitest';
import { contrastRatio, colorRgb, textOn } from '../src/sim-core/draw';

describe('Kontrast (WCAG)', () => {
  it('liest Farben', () => {
    expect(colorRgb('#fff')).toEqual([255, 255, 255]);
    expect(colorRgb('#2563eb')).toEqual([37, 99, 235]);
    expect(colorRgb('#2563ebcc')).toEqual([37, 99, 235]);
    expect(colorRgb('rgba(10, 20, 30, 0.5)')).toEqual([10, 20, 30]);
    expect(colorRgb('rgb(10 20 30 / 50%)')).toEqual([10, 20, 30]);
    expect(colorRgb('red')).toBeNull();
  });

  it('berechnet das Kontrastverhältnis', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#fff', '#fff')).toBeCloseTo(1, 5);
    // Weiß auf der hellen Reihenfarbe 1 im Dunkelmodus reicht nicht
    expect(contrastRatio('#ffffff', '#6ea0ff')!).toBeLessThan(4.5);
  });

  it('wählt die Textfarbe auf farbigen Flächen', () => {
    const light = { dark: false, bg: '#ffffff' };
    const dark = { dark: true, bg: '#10161f' };
    // Hell: unverändert
    expect(textOn('#e8590c', light)).toBe('#ffffff');
    // Dunkel: auf hellen Reihenfarben dunkler Text, auf dunklen Flächen weiter Weiß
    expect(textOn('#6ea0ff', dark)).toBe('#10161f');
    expect(textOn('#ffa94d', dark)).toBe('#10161f');
    expect(textOn('#1c2434', dark)).toBe('#ffffff');
    expect(textOn('unbekannt', dark)).toBe('#ffffff');
  });
});
