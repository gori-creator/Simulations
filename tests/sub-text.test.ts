import { describe, expect, it } from 'vitest';
import { measureSubText, parseSubText, subText } from '../src/sim-core/draw';

describe('Text mit tiefgestelltem Index', () => {
  it('zerlegt einfache Indizes', () => {
    expect(parseSubText('F_G')).toEqual([
      { text: 'F', sub: false },
      { text: 'G', sub: true },
    ]);
    expect(parseSubText('a_1 + v_0 · t')).toEqual([
      { text: 'a', sub: false },
      { text: '1', sub: true },
      { text: ' + v', sub: false },
      { text: '0', sub: true },
      { text: ' · t', sub: false },
    ]);
    expect(parseSubText('F_res = 5 N')).toEqual([
      { text: 'F', sub: false },
      { text: 'res', sub: true },
      { text: ' = 5 N', sub: false },
    ]);
  });

  it('kennt Klammern, Unterstriche und Sonderfälle', () => {
    expect(parseSubText('F_{G,1}')).toEqual([
      { text: 'F', sub: false },
      { text: 'G,1', sub: true },
    ]);
    expect(parseSubText('E_kin')).toEqual([
      { text: 'E', sub: false },
      { text: 'kin', sub: true },
    ]);
    expect(parseSubText('a\\_b')).toEqual([{ text: 'a_b', sub: false }]);
    expect(parseSubText('x_ und _')).toEqual([{ text: 'x_ und _', sub: false }]);
    expect(parseSubText('s = 3 m')).toEqual([{ text: 's = 3 m', sub: false }]);
    expect(parseSubText('')).toEqual([]);
  });

  it('misst und richtet nach der Gesamtbreite aus', () => {
    // Einfache Attrappe: jedes Zeichen ist so breit wie die Schriftgröße × 0,5.
    const calls: { text: string; x: number; y: number; font: string }[] = [];
    let font = '';
    const g = {
      get font() {
        return font;
      },
      set font(value: string) {
        font = value;
      },
      measureText: (t: string) => ({ width: t.length * Number(/(\d+(?:\.\d+)?)px/.exec(font)![1]) * 0.5 }),
      fillText: (text: string, x: number, y: number) => calls.push({ text, x, y, font }),
      strokeText: () => {},
      save: () => {},
      restore: () => {},
    } as unknown as CanvasRenderingContext2D;
    const style = { size: 20, family: 'sans-serif', color: '#000', align: 'right' as const };
    // „F“ 10 px, „G“ in 15 px Schrift → 7,5 px
    expect(measureSubText(g, 'F_G', style)).toBeCloseTo(17.5);
    const width = subText(g, 'F_G', 100, 50, style);
    expect(width).toBeCloseTo(17.5);
    expect(calls[0]).toMatchObject({ text: 'F', x: 82.5, y: 50 });
    expect(calls[1]!.text).toBe('G');
    expect(calls[1]!.x).toBeCloseTo(92.5);
    expect(calls[1]!.y).toBeGreaterThan(50);
    expect(calls[1]!.font).toContain('15px');
  });
});
