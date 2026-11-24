import { describe, expect, it } from 'vitest';
import { clean, CONTEXTS, contextReach, contextValue, hits, lineRelation, tableRows, targetLine } from '../src/simulations/mathematik/lineare-funktion/model';

describe('Wertetabelle', () => {
  it('gleiche x-Schritte ergeben gleiche y-Schritte (Differenz = m)', () => {
    const rows = tableRows(0.3, -1, -2, 6);
    expect(rows.map((r) => r.x)).toEqual([-2, -1, 0, 1, 2, 3]);
    for (let i = 1; i < rows.length; i++) expect(clean(rows[i]!.y - rows[i - 1]!.y)).toBe(0.3);
    expect(rows[2]!.y).toBe(-1);
    expect(clean(0.1 * 3)).toBe(0.3);
    expect(Object.is(clean(-0), 0)).toBe(true);
  });
});

describe('Übung „Gerade treffen“', () => {
  it('Aufgaben sind reproduzierbar, gut ablesbar und abwechslungsreich', () => {
    const seen = new Set<string>();
    for (let n = 1; n <= 60; n++) {
      const a = targetLine(n);
      expect(a).toEqual(targetLine(n));
      expect(Number.isInteger(a.t)).toBe(true);
      expect(Math.abs(a.t)).toBeLessThanOrEqual(5);
      expect(Math.abs(a.m)).toBeLessThanOrEqual(3);
      expect(Math.round(a.m * 10) / 10).toBe(a.m);
      seen.add(`${a.m}|${a.t}`);
    }
    expect(seen.size).toBeGreaterThan(30);
  });
  it('getroffen nur bei passender Steigung und passendem Achsenabschnitt', () => {
    expect(hits(1.5, -2, { m: 1.5, t: -2 })).toBe(true);
    expect(hits(1.5000001, -2, { m: 1.5, t: -2 })).toBe(true);
    expect(hits(1.4, -2, { m: 1.5, t: -2 })).toBe(false);
    expect(hits(1.5, -1.9, { m: 1.5, t: -2 })).toBe(false);
  });
});

describe('Sachsituationen', () => {
  it('Taxi: 6 km kosten 3,50 € + 6 · 2 € = 15,50 €', () => {
    const c = CONTEXTS.taxi;
    expect(contextValue(c, c.lines[0]!, 6)).toBe(15.5);
  });
  it('Kerze: nach 4 h noch 14 cm, abgebrannt nach 13⅓ h, nie negativ', () => {
    const c = CONTEXTS.candle;
    expect(contextValue(c, c.lines[0]!, 4)).toBe(14);
    expect(contextReach(c.lines[0]!, 0)).toBeCloseTo(40 / 3, 9);
    expect(contextValue(c, c.lines[0]!, 15)).toBe(0);
  });
  it('Handytarife: gleich teuer bei 200 Minuten (je 23 €)', () => {
    const [a, b] = CONTEXTS.tariff.lines;
    const rel = lineRelation(a!.m, a!.t, b!.m, b!.t);
    expect(rel.kind).toBe('intersect');
    if (rel.kind === 'intersect') {
      expect(rel.x).toBeCloseTo(200, 9);
      expect(rel.y).toBeCloseTo(23, 9);
    }
  });
  it('Tank: nach 3 min 85 l; Bereich passt zu allen Geraden', () => {
    const c = CONTEXTS.tank;
    expect(contextValue(c, c.lines[0]!, 3)).toBe(85);
    for (const k of Object.values(CONTEXTS)) {
      expect(k.x0).toBeGreaterThanOrEqual(k.x[0]);
      expect(k.x0).toBeLessThanOrEqual(k.x[1]);
      for (const l of k.lines) {
        const y = contextValue(k, l, k.x[1]);
        expect(y).toBeLessThanOrEqual(k.y[1]);
      }
    }
  });
});
