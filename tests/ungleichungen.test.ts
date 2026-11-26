import { describe, expect, it } from 'vitest';
import {
  checkTask,
  combinedKind,
  countIntegers,
  flip,
  holds,
  inCombined,
  inHalfPlane,
  inSolution,
  makeTask,
  numText,
  SCENARIOS,
  scenarioAnswer,
  solve,
  steps,
  termText,
  type Rel,
} from '../src/simulations/mathematik/ungleichungen/model';

describe('Ungleichungen', () => {
  it('kehrt das Zeichen um', () => {
    expect(flip('lt')).toBe('gt');
    expect(flip('ge')).toBe('le');
    expect(flip(flip('le'))).toBe('le');
  });

  it('löst einfache Ungleichungen', () => {
    expect(solve(2, 1, 0, 7, 'lt')).toEqual({ kind: 'bound', rel: 'lt', x: 3 });
    // −2x + 4 ≥ 0 → x ≤ 2 (Zeichen dreht sich)
    expect(solve(-2, 4, 0, 0, 'ge')).toEqual({
      kind: 'bound',
      rel: 'le',
      x: 2,
    });
    expect(steps(-2, 4, 0, 0, 'ge').flipped).toBe(true);
    // 3x − 2 > x + 4 → x > 3
    expect(solve(3, -2, 1, 4, 'gt')).toEqual({
      kind: 'bound',
      rel: 'gt',
      x: 3,
    });
  });

  it('erkennt immer und nie erfüllte Ungleichungen', () => {
    expect(solve(1, 1, 1, 0, 'gt')).toEqual({ kind: 'all' });
    expect(solve(1, 0, 1, 1, 'gt')).toEqual({ kind: 'none' });
    expect(solve(1, 0, 1, 0, 'le')).toEqual({ kind: 'all' });
    expect(solve(1, 0, 1, 0, 'lt')).toEqual({ kind: 'none' });
  });

  it('stimmt mit dem Einsetzen überein', () => {
    const rels: Rel[] = ['lt', 'le', 'gt', 'ge'];
    for (const rel of rels)
      for (let a = -3; a <= 3; a++)
        for (let c = -2; c <= 2; c++)
          for (const b of [-2, 0, 3])
            for (const d of [-1, 2]) {
              const sol = solve(a, b, c, d, rel);
              for (let x = -6; x <= 6; x += 0.5) expect(inSolution(sol, x)).toBe(holds(a * x + b, c * x + d, rel));
            }
  });
});

describe('zwei Bedingungen', () => {
  it('erkennt Intervall, leere Menge und ganz ℝ', () => {
    expect(
      combinedKind({
        lo: -2,
        loClosed: false,
        hi: 3,
        hiClosed: true,
        op: 'und',
      }),
    ).toBe('interval');
    expect(
      combinedKind({
        lo: 5,
        loClosed: false,
        hi: 1,
        hiClosed: false,
        op: 'und',
      }),
    ).toBe('empty');
    expect(
      combinedKind({
        lo: 2,
        loClosed: false,
        hi: 2,
        hiClosed: false,
        op: 'und',
      }),
    ).toBe('empty');
    expect(combinedKind({ lo: 2, loClosed: true, hi: 2, hiClosed: true, op: 'und' })).toBe('interval');
    expect(
      combinedKind({
        lo: -1,
        loClosed: false,
        hi: 4,
        hiClosed: false,
        op: 'oder',
      }),
    ).toBe('all');
    expect(
      combinedKind({
        lo: 4,
        loClosed: false,
        hi: -3,
        hiClosed: false,
        op: 'oder',
      }),
    ).toBe('two');
  });
  it('zählt ganze Zahlen richtig', () => {
    expect(
      countIntegers({
        lo: -2,
        loClosed: false,
        hi: 3,
        hiClosed: true,
        op: 'und',
      }),
    ).toBe(5);
    expect(
      countIntegers({
        lo: -2,
        loClosed: true,
        hi: 3,
        hiClosed: true,
        op: 'und',
      }),
    ).toBe(6);
    expect(
      countIntegers({
        lo: -2,
        loClosed: false,
        hi: 3,
        hiClosed: false,
        op: 'und',
      }),
    ).toBe(4);
    expect(
      countIntegers({
        lo: 0.5,
        loClosed: false,
        hi: 2.5,
        hiClosed: false,
        op: 'und',
      }),
    ).toBe(2);
    expect(
      countIntegers({
        lo: 5,
        loClosed: false,
        hi: 1,
        hiClosed: false,
        op: 'und',
      }),
    ).toBe(0);
    expect(
      countIntegers({
        lo: 4,
        loClosed: false,
        hi: -3,
        hiClosed: false,
        op: 'oder',
      }),
    ).toBe(-1);
  });
  it('prüft einzelne Zahlen', () => {
    const c = {
      lo: -2,
      loClosed: false,
      hi: 3,
      hiClosed: true,
      op: 'und' as const,
    };
    expect(inCombined(c, -2)).toBe(false);
    expect(inCombined(c, 3)).toBe(true);
    expect(inCombined({ ...c, op: 'oder', lo: 4, hi: -3 }, 0)).toBe(false);
    expect(inCombined({ ...c, op: 'oder', lo: 4, hi: -3 }, 5)).toBe(true);
  });
});

describe('Alltag', () => {
  it('liefert die passenden Grenzen', () => {
    expect(scenarioAnswer(SCENARIOS.handy)).toMatchObject({
      best: 112,
      side: 'min',
    });
    expect(scenarioAnswer(SCENARIOS.fitness)).toMatchObject({
      best: 7,
      side: 'min',
    });
    expect(scenarioAnswer(SCENARIOS.sparen)).toMatchObject({
      best: 19,
      side: 'min',
    });
    expect(scenarioAnswer(SCENARIOS.aufzug)).toMatchObject({
      best: 22,
      side: 'max',
    });
    const taxi = scenarioAnswer(SCENARIOS.taxi);
    expect(taxi.side).toBe('max');
    expect(taxi.bound).toBeCloseTo(21 / 2.2, 6);
    expect(taxi.best).toBe(9.54);
  });
  it('rundet bei genauer Grenze nicht falsch', () => {
    // 6x + 30 ≥ 150 → x ≥ 20 genau
    expect(scenarioAnswer({ ...SCENARIOS.sparen, b: 30 }).best).toBe(20);
    // 25x + 80 < 630 → x < 22 → höchstens 21
    expect(scenarioAnswer({ ...SCENARIOS.aufzug, rel: 'lt' }).best).toBe(21);
  });
  it('alle Situationen haben ihre Grenze im sichtbaren Bereich', () => {
    for (const s of Object.values(SCENARIOS)) {
      const a = scenarioAnswer(s);
      expect(a.bound).toBeGreaterThan(0);
      expect(a.bound).toBeLessThan(s.xMax);
    }
  });
});

describe('Halbebene', () => {
  it('prüft Punkte ober- und unterhalb', () => {
    expect(inHalfPlane(0.5, 1, 'lt', 2, 1)).toBe(true);
    expect(inHalfPlane(0.5, 1, 'lt', 2, 2)).toBe(false);
    expect(inHalfPlane(0.5, 1, 'le', 2, 2)).toBe(true);
    expect(inHalfPlane(-1, 2, 'ge', 3, 0)).toBe(true);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(5)).toEqual(makeTask(5));
    const kinds = new Set(Array.from({ length: 12 }, (_, i) => makeTask(i + 1).kind));
    expect(kinds.size).toBe(6);
  });
  it('die hinterlegte Antwort wird als richtig erkannt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(Number.isFinite(t.answer)).toBe(true);
      const input = String(t.answer).replace('-', '−').replace('.', ',');
      expect(checkTask(t, input)).toBe(true);
      expect(checkTask(t, String(t.answer + 7))).toBe(false);
      if (t.choices) expect(t.answer).toBeGreaterThanOrEqual(1);
      if (t.choices) expect(t.answer).toBeLessThanOrEqual(t.choices.length);
    }
  });
  it('Umdreh-Aufgaben erklären das Umdrehen', () => {
    for (let i = 1; i <= 200; i++) {
      const t = makeTask(i);
      if (t.kind === 'flip') expect(t.solution.de).toContain('umgedreht');
    }
  });
  it('akzeptiert „x < 3“ und lehnt Unsinn ab', () => {
    const t = makeTask(1);
    expect(checkTask(t, `x < ${t.answer}`)).toBe(true);
    expect(checkTask(t, 'abc')).toBeNull();
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});

describe('Text-Helfer', () => {
  it('formatiert Terme', () => {
    expect(termText(2, 1, 'de')).toBe('2x + 1');
    expect(termText(-1, 0, 'de')).toBe('−x');
    expect(termText(0, -3, 'en')).toBe('−3');
    expect(termText(0.5, -2.5, 'de')).toBe('0,5x − 2,5');
    expect(numText(-1.25, 'en')).toBe('−1.25');
  });
});
