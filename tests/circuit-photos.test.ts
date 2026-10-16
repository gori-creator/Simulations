import { describe, expect, it } from 'vitest';
import { unlitBulbPixels } from '../src/sim-core';
import { RING_COLORS, RING_GOLD, RING_SILVER, resistorBands } from '../src/simulations/physik/reihe-parallel/model';

const [BLACK, BROWN, RED, , , GREEN, BLUE] = RING_COLORS;

describe('Farbringe des Widerstandsfotos', () => {
  it('codiert zweistellige Werte mit vier Ringen (Gold = ±5 %)', () => {
    expect(resistorBands(20)).toEqual([RED, BLACK, BLACK, RING_GOLD]);
    expect(resistorBands(47)).toEqual([RING_COLORS[4], RING_COLORS[7], BLACK, RING_GOLD]);
    expect(resistorBands(200)).toEqual([RED, BLACK, BROWN, RING_GOLD]);
    // 5 Ω = 50 · 0,1 Ω → Gold als Multiplikator
    expect(resistorBands(5)).toEqual([GREEN, BLACK, RING_GOLD, RING_GOLD]);
    expect(resistorBands(0.47)).toEqual([RING_COLORS[4], RING_COLORS[7], RING_SILVER, RING_GOLD]);
  });

  it('nimmt fünf Ringe, wenn drei Ziffern nötig sind (Braun = ±1 %)', () => {
    expect(resistorBands(105)).toEqual([BROWN, BLACK, GREEN, BLACK, BROWN]);
    expect(resistorBands(165)).toEqual([BROWN, BLUE, GREEN, BLACK, BROWN]);
  });

  it('zeigt jeden einstellbaren Wert der Simulation exakt', () => {
    for (let R = 5; R <= 200; R += 5) {
      const b = resistorBands(R);
      const digits = b.slice(0, b.length - 2).map((c) => RING_COLORS.indexOf(c));
      const m = b[b.length - 2]!;
      const e = m === RING_GOLD ? -1 : m === RING_SILVER ? -2 : RING_COLORS.indexOf(m);
      expect(Number(digits.join('')) * 10 ** e).toBeCloseTo(R, 9);
    }
  });
});

describe('ausgeschaltete Glühlampe aus dem leuchtenden Foto', () => {
  /** 20 × 20 Pixel: warmes Glas, in der Mitte eine helle „Wendel“, unten Sockel. */
  function bulb(): Uint8ClampedArray {
    const w = 20;
    const data = new Uint8ClampedArray(w * w * 4);
    for (let y = 0; y < w; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const hot = y === 6 && x >= 6 && x <= 13;
        data.set(hot ? [255, 240, 200, 255] : y >= 15 ? [20, 15, 10, 255] : [205, 145, 95, 255], i);
      }
    }
    return data;
  }

  it('entfernt das warme Licht, macht die Wendel dunkel und lässt den Sockel unverändert', () => {
    const data = bulb();
    unlitBulbPixels(data, 20, 20, 15, 3);
    const px = (x: number, y: number) => Array.from(data.slice((y * 20 + x) * 4, (y * 20 + x) * 4 + 4));
    const glass = px(3, 3);
    // Glas: kühl (Blau ≥ Rot) und leicht durchsichtig
    expect(glass[2]!).toBeGreaterThanOrEqual(glass[0]!);
    expect(glass[3]!).toBeLessThan(255);
    // Wendel dunkler als das Glas daneben
    expect(px(9, 6)[0]!).toBeLessThan(px(9, 3)[0]!);
    // Sockel unverändert
    expect(px(9, 17)).toEqual([20, 15, 10, 255]);
  });
});
