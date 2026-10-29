import { describe, expect, it } from 'vitest';
import { clampFontSize, MIN_FONT_PX } from '../src/sim-core/surface';

describe('sim-core: Mindestschriftgröße in den Zeichenflächen', () => {
  it('hebt kleine Größen auf das Minimum an', () => {
    expect(clampFontSize('600 9px Inter')).toBe(`600 ${MIN_FONT_PX}px Inter`);
    expect(clampFontSize('10.5px system-ui')).toBe(`${MIN_FONT_PX}px system-ui`);
    expect(clampFontSize('italic 700 10px "KaTeX_Math", serif')).toBe(`italic 700 ${MIN_FONT_PX}px "KaTeX_Math", serif`);
  });

  it('lässt größere Angaben und Schriftnamen mit Zahlen unverändert', () => {
    expect(clampFontSize('700 13px Inter')).toBe('700 13px Inter');
    expect(clampFontSize('11px Inter')).toBe('11px Inter');
    expect(clampFontSize('600 12px Font9px')).toBe('600 12px Font9px');
  });
});
