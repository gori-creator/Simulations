import { describe, expect, it } from 'vitest';
import { outerExtent, polygonBounds, rearrangedWidth } from '../src/simulations/mathematik/kreiszahl-pi/model';
import { formatNumber } from '../src/sim-core';

describe('Kreiszahl π: Prüfwerte', () => {
  it('Umfang und Fläche wie im Unterricht', () => {
    // r = 3 cm: U = 6π ≈ 18,85 cm, A = 9π ≈ 28,27 cm²
    expect(formatNumber(2 * Math.PI * 3, 'de')).toBe('18,85');
    expect(formatNumber(Math.PI * 3 ** 2, 'de')).toBe('28,27');
    // d = 10 cm: U ≈ 31,42 cm
    expect(formatNumber(Math.PI * 10, 'de')).toBe('31,42');
  });

  it('Archimedes: Sechseck und 96-Eck', () => {
    const six = polygonBounds(6);
    expect(six.lower).toBeCloseTo(3, 12);
    expect(six.upper).toBeCloseTo(2 * Math.sqrt(3), 12);
    const b = polygonBounds(96);
    expect(formatNumber(b.lower, 'de', { decimals: 4, fixed: true })).toBe('3,1410');
    expect(formatNumber(b.upper, 'de', { decimals: 4, fixed: true })).toBe('3,1427');
    // Archimedes' Brüche liegen außerhalb der genauen Schranken
    expect(3 + 10 / 71).toBeLessThan(b.lower);
    expect(3 + 1 / 7).toBeGreaterThan(b.upper);
  });

  it('gerundete Schranken (4 und 5 Stellen) schließen π für alle Eckenzahlen ein', () => {
    for (let m = 3; m <= 96; m++) {
      const { lower, upper } = polygonBounds(m);
      expect(lower).toBeLessThan(Math.PI);
      expect(upper).toBeGreaterThan(Math.PI);
      for (const dec of [4, 5]) {
        const f = 10 ** dec;
        expect(Math.round(lower * f) / f).toBeLessThan(Math.PI);
        expect(Math.round(upper * f) / f).toBeGreaterThan(Math.PI);
      }
    }
  });

  it('umgelegte Sektoren: Breite wächst gegen π·r', () => {
    expect(rearrangedWidth(4, 1)).toBeCloseTo(2 * Math.SQRT2, 12);
    expect(rearrangedWidth(12, 2)).toBeLessThan(rearrangedWidth(48, 2));
    expect(rearrangedWidth(48, 2)).toBeLessThan(2 * Math.PI);
  });

  it('umbeschriebenes Dreieck/Quadrat: Ausdehnung für den Bildausschnitt', () => {
    const t = outerExtent(3, 1);
    expect(t.yMax).toBeCloseTo(2, 12); // Umkreisradius r / cos 60° = 2r
    expect(t.yMin).toBeCloseTo(-1, 12); // Seite berührt den Kreis unten
    expect(t.xMax).toBeCloseTo(Math.sqrt(3), 12);
    const q = outerExtent(4, 1);
    expect(q.yMax).toBeCloseTo(Math.SQRT2, 12);
    const s = outerExtent(96, 1);
    expect(s.yMax).toBeLessThan(1.001);
  });
});
