import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { checkSum, PROFILES, sumTask, volume } from '../src/simulations/mathematik/ober-untersummen/model';

describe('Ober-/Untersummen: Zufluss', () => {
  it('R ist Stammfunktion von r mit R(0) = 0', () => {
    for (const p of Object.values(PROFILES)) {
      expect(p.R(0)).toBeCloseTo(0, 12);
      for (const t of [0.5, 2, 4.3, 7, 9.9]) {
        const h = 1e-5;
        expect((p.R(t + h) - p.R(t - h)) / (2 * h)).toBeCloseTo(p.rate(t), 5);
      }
    }
  });
  it('das Becken läuft nie leer und nie über (0 bis 40 Liter)', () => {
    for (const p of Object.values(PROFILES)) {
      for (let t = 0; t <= 10; t += 0.05) {
        expect(volume(p, t)).toBeGreaterThanOrEqual(0);
        expect(volume(p, t)).toBeLessThanOrEqual(40);
      }
    }
  });
  it('Abfluss: höchster Stand bei t = 4, danach sinkt das Wasser', () => {
    const p = PROFILES.outflow;
    expect(volume(p, 4)).toBeCloseTo(28);
    expect(volume(p, 10)).toBeCloseTo(10);
  });
});

describe('Ober-/Untersummen: Üben', () => {
  it('Lehrbuchbeispiel x² auf [0; 2], n = 4', () => {
    // Aufgabe so lange suchen, bis das Beispiel vorkommt
    let found = false;
    for (let q = 3; q < 400 && !found; q++) {
      const t = sumTask(q, seededRandom(q));
      if (t.fn === 'x2' && t.a === 0 && t.b === 2 && t.n === 4 && t.kind === 'lower') {
        expect(t.answer).toBeCloseTo(1.75, 12);
        expect(t.heights).toEqual([0, 0.25, 1, 2.25]);
        found = true;
      }
    }
    expect(found).toBe(true);
  });
  it('Antwort = Breite · Summe der Höhen; erste Aufgaben Links-/Rechtssumme', () => {
    expect(sumTask(1, seededRandom(1)).kind).toBe('left');
    expect(sumTask(2, seededRandom(2)).kind).toBe('right');
    for (let q = 1; q <= 200; q++) {
      const t = sumTask(q, seededRandom(q * 13 + 1));
      expect(t.heights.length).toBe(t.n);
      expect(t.answer).toBeCloseTo(t.width * t.heights.reduce((s, h) => s + h, 0), 12);
      // steigende Funktionen: Untersumme = Linkssumme, Obersumme = Rechtssumme
      if (t.kind === 'lower') expect(t.heights[0]).toBeCloseTo(t.fn === 'x2' ? t.a * t.a : Math.sqrt(t.a), 12);
    }
  });
  it('Prüfung erlaubt Runden auf zwei Stellen', () => {
    const t = sumTask(1, seededRandom(1));
    expect(checkSum(t, t.answer.toFixed(2).replace('.', ',')).ok).toBe(true);
    expect(checkSum(t, String(t.answer + 0.2)).ok).toBe(false);
    expect(checkSum(t, 'x').got).toBeNull();
  });
});
