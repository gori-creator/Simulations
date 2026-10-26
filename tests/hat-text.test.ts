import { describe, expect, it } from 'vitest';
import { drawHatText, hasRichText, measureHatText, splitHats, subText } from '../src/sim-core/draw';
import { hatsInHtml, plainSubText, subLabelHtml } from '../src/sim-core/rich-label';

/** Zeichenflächen-Attrappe: jedes Zeichen 0,5 × Schriftgröße breit, Aufrufe werden mitgeschrieben. */
function mockCanvas() {
  const calls: string[] = [];
  let font = '14px sans-serif';
  const size = () => Number(/(\d+(?:\.\d+)?)px/.exec(font)![1]);
  const g = {
    get font() {
      return font;
    },
    set font(v: string) {
      font = v;
    },
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineJoin: 'miter',
    lineCap: 'butt',
    textAlign: 'left',
    textBaseline: 'middle',
    measureText: (t: string) => ({ width: [...t].length * size() * 0.5 }),
    fillText: (t: string) => calls.push(`fill:${t}`),
    strokeText: (t: string) => calls.push(`strokeText:${t}`),
    beginPath: () => calls.push('path'),
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => calls.push('stroke'),
    save: () => {},
    restore: () => {},
  };
  return { g: g as unknown as CanvasRenderingContext2D, calls };
}

describe('Dach über Zeichen (U+0302, „φ̂“)', () => {
  it('zerlegt Text an Zeichen mit Dach', () => {
    expect(splitHats('Amplitude φ̂ in °')).toEqual([
      { text: 'Amplitude ', hat: false },
      { text: 'φ', hat: true },
      { text: ' in °', hat: false },
    ]);
    expect(splitHats('v̂x̂')).toEqual([
      { text: 'v', hat: true },
      { text: 'x', hat: true },
    ]);
    expect(splitHats('ohne Dach')).toEqual([{ text: 'ohne Dach', hat: false }]);
    expect(splitHats('')).toEqual([]);
    expect(hasRichText('φ̂')).toBe(true);
    expect(hasRichText('F_G')).toBe(true);
    expect(hasRichText('Masse m')).toBe(false);
  });

  it('zeichnet das Dach selbst und misst nur das Grundzeichen', () => {
    const { g, calls } = mockCanvas();
    expect(measureHatText(g, 'φ̂')).toBe(7);
    expect(drawHatText(g, 'a φ̂', 0, 0, 'fill')).toBe(21);
    expect(calls).toEqual(['fill:a ', 'fill:φ', 'path', 'stroke']);
    // ohne Dach genau ein fillText wie bisher
    const plain = mockCanvas();
    drawHatText(plain.g, 'F = 5 N', 0, 0, 'fill');
    expect(plain.calls).toEqual(['fill:F = 5 N']);
  });

  it('setzt Dach und Index zusammen in subText', () => {
    const { g, calls } = mockCanvas();
    subText(g, 'φ̂_E', 0, 0, { size: 14, family: 'sans-serif', color: '#000', halo: '#fff' });
    expect(calls.filter((c) => c === 'stroke').length).toBe(2); // Rand und Füllung
    expect(calls).toContain('fill:φ');
    expect(calls).toContain('fill:E');
    expect(calls.some((c) => c.includes('̂'))).toBe(false);
  });

  it('setzt das Dach in Beschriftungen und HTML-Ergebnissen als <span class="hat">', () => {
    expect(subLabelHtml('Erregeramplitude φ̂_E')).toBe(
      '<span aria-hidden="true">Erregeramplitude <span class="hat">φ</span><sub>E</sub></span><span class="visually-hidden">Erregeramplitude φ̂ E</span>',
    );
    // vorkomponierte Zeichen (ŷ) bleiben unverändert
    expect(subLabelHtml('Amplitude ŷ')).toBeNull();
    expect(subLabelHtml('Amplitude v̂')).toContain('<span class="hat hat--low">v</span>');
    expect(plainSubText('φ̂_E')).toBe('φ̂ E');
    // HTML: nur im Text, Tags bleiben unverändert
    expect(hatsInHtml('<var>φ̂</var> = <var title="φ̂">x̂</var>')).toBe(
      '<var><span class="hat">φ<span class="visually-hidden">̂</span></span></var> = <var title="φ̂"><span class="hat hat--low">x<span class="visually-hidden">̂</span></span></var>',
    );
    expect(hatsInHtml('<b>ohne</b> Dach')).toBe('<b>ohne</b> Dach');
    // maskiert sicher
    expect(subLabelHtml('<i>φ̂</i>')).not.toContain('<i>');
  });
});
