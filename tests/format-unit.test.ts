import { describe, expect, it } from 'vitest';
import { bindUnits, bindUnitsHtml, Formatter, NBSP, withUnit } from '../src/sim-core/format';

describe('Zahl und Einheit ohne Umbruch', () => {
  it('verbindet mit geschütztem Leerzeichen', () => {
    expect(withUnit('2,5', 'm/s')).toBe(`2,5${NBSP}m/s`);
    expect(withUnit('3', '')).toBe('3');
    expect(new Formatter('de').unit(2.5, 'm/s')).toBe(`2,5${NBSP}m/s`);
    expect(new Formatter('en').unit(-1.25, '°C', 1)).toBe(`−1.3${NBSP}°C`);
  });

  it('setzt Einheiten in fertigen Texten fest', () => {
    expect(bindUnits('v = 2,5 m/s')).toBe(`v = 2,5${NBSP}m/s`);
    expect(bindUnits('T = 20 °C, 300 K')).toBe(`T = 20${NBSP}°C, 300${NBSP}K`);
    expect(bindUnits('a = 9,81 m/s²')).toBe(`a = 9,81${NBSP}m/s²`);
    expect(bindUnits('R = 4,7 kΩ (50 %)')).toBe(`R = 4,7${NBSP}kΩ (50${NBSP}%)`);
    expect(bindUnits('W = 33,0 J ≈ 2 N·m')).toBe(`W = 33,0${NBSP}J ≈ 2${NBSP}N·m`);
    expect(bindUnits('v = 54 km/h')).toBe(`v = 54${NBSP}km/h`);
  });

  it('lässt Rechenzeichen, Punkte und lange Wörter in Ruhe', () => {
    for (const text of ['3 + 4 = 7', '(1,5 | 2)', '2 · 3', '1 2 3', 'x = 5 Zentimeter', 'sin 30° = 0,5', '']) {
      expect(bindUnits(text)).toBe(text);
    }
  });

  it('ändert in HTML nur den Text, nicht die Tags', () => {
    expect(bindUnitsHtml('<span style="width: 3 px">s = 12 m</span>')).toBe(`<span style="width: 3 px">s = 12${NBSP}m</span>`);
  });
});
