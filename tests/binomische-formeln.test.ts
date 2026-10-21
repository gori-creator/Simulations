import { describe, expect, it } from 'vitest';
import { expand, piecesFirst, type Formula } from '../src/simulations/mathematik/binomische-formeln/model';

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

describe('binomische-formeln: Prüfwerte', () => {
  it('a = 5, b = 3: 64 = 25 + 30 + 9; 4 = 25 − 30 + 9; 16 = 25 − 9', () => {
    expect(expand('1', 5, 3)).toEqual({ left: 64, terms: [25, 30, 9], right: 64 });
    expect(expand('2', 5, 3)).toEqual({ left: 4, terms: [25, -30, 9], right: 4 });
    expect(expand('3', 5, 3)).toEqual({ left: 16, terms: [25, -9], right: 16 });
  });

  it('Kopfrechnen: 51² = 2601, 49² = 2401, 49 · 51 = 2499, 53² = 2809, 21 · 19 = 399', () => {
    expect(expand('1', 50, 1).right).toBe(2601);
    expect(expand('2', 50, 1).right).toBe(2401);
    expect(expand('3', 50, 1).right).toBe(2499);
    expect(expand('1', 50, 3).right).toBe(2809);
    expect(expand('3', 20, 1).right).toBe(399);
  });

  it('typischer Fehler: (a + b)² ≠ a² + b², es fehlen die zwei Rechtecke 2ab', () => {
    const e = expand('1', 5, 2);
    expect(e.left).toBe(49);
    expect(e.left - (5 * 5 + 2 * 2)).toBe(20);
    expect(e.terms[1]).toBe(2 * 5 * 2);
  });
});

describe('binomische-formeln: Grenzfälle', () => {
  it('b = 0: alle Formeln liefern a²', () => {
    for (const f of ['1', '2', '3'] as Formula[]) {
      const e = expand(f, 4, 0);
      expect(e.left).toBe(16);
      expect(e.right).toBe(16);
    }
  });

  it('a = b: 2. und 3. Formel ergeben 0', () => {
    expect(expand('2', 3, 3).left).toBe(0);
    expect(expand('2', 3, 3).right).toBe(0);
    expect(expand('3', 3, 3).left).toBe(0);
    expect(expand('3', 3, 3).right).toBe(0);
  });

  it('b > a: die Formeln gelten weiter (nur das Flächenmodell nicht)', () => {
    const e2 = expand('2', 2, 5);
    expect(e2.left).toBe(9);
    expect(sum(e2.terms)).toBe(9);
    const e3 = expand('3', 2, 5);
    expect(e3.left).toBe(-21);
    expect(sum(e3.terms)).toBe(-21);
  });

  it('alle Reglerwerte (Schritt 0,5): linke Seite = Summe der Teilterme = rechte Seite', () => {
    for (let a = 1; a <= 10; a += 0.5) {
      for (let b = 0.5; b <= 6; b += 0.5) {
        for (const f of ['1', '2', '3'] as Formula[]) {
          const e = expand(f, a, b);
          expect(sum(e.terms)).toBeCloseTo(e.left, 10);
          expect(e.right).toBeCloseTo(e.left, 10);
        }
      }
    }
  });
});

describe('binomische-formeln: Flächenmodell der 1. Formel', () => {
  it('vier Teile füllen das Quadrat (a + b)² lückenlos und ohne Überlappung', () => {
    const a = 5;
    const b = 3;
    const pieces = piecesFirst(a, b);
    expect(pieces.map((p) => p.key)).toEqual(['a2', 'ab', 'ab', 'b2']);
    expect(sum(pieces.map((p) => p.w * p.h))).toBe((a + b) ** 2);
    for (const p of pieces) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.w).toBeLessThanOrEqual(a + b);
      expect(p.y + p.h).toBeLessThanOrEqual(a + b);
    }
    for (let i = 0; i < pieces.length; i++) {
      for (let j = i + 1; j < pieces.length; j++) {
        const p = pieces[i]!;
        const q = pieces[j]!;
        const ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
        const oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
        expect(ox <= 0 || oy <= 0).toBe(true);
      }
    }
    expect(pieces.filter((p) => p.key === 'ab').every((p) => p.w * p.h === a * b)).toBe(true);
  });
});
