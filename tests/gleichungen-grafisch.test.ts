import { describe, expect, it } from 'vitest';
import {
  agreedDigits,
  bisectStep,
  caseOf,
  evalFn,
  exactText,
  isCompound,
  nextInterval,
  numText,
  partsText,
  polyRoots,
  rootText,
  safeDecimals,
  solveEquation,
  startInterval,
  substParts,
  termParts,
  type Fn,
} from '../src/simulations/mathematik/gleichungen-grafisch/model';

const base: Fn = { kind: 'lin', m: 0, t: 0, a: 1, d: 0, e: 0 };
const lin = (m: number, t: number): Fn => ({ ...base, kind: 'lin', m, t });
const quad = (a: number, d: number, e: number): Fn => ({ ...base, kind: 'quad', a, d, e });
const hyp = (a: number, d: number, e: number): Fn => ({ ...base, kind: 'hyp', a, d, e });
const abs = (a: number, d: number, e: number): Fn => ({ ...base, kind: 'abs', a, d, e });
const xs = (f: Fn, g: Fn) => solveEquation(f, g).roots.map((r) => r.x);

describe('Modell: Gleichungen grafisch lösen', () => {
  it('löst lineare Gleichungen', () => {
    // 2x − 1 = −x + 5  ⇒  x = 2
    expect(xs(lin(2, -1), lin(-1, 5))).toEqual([2]);
    expect(caseOf(solveEquation(lin(2, -1), lin(-1, 5)))).toBe('one');
    // parallel: keine Lösung; identisch: unendlich viele
    expect(caseOf(solveEquation(lin(0.5, 1), lin(0.5, -2)))).toBe('none');
    const same = solveEquation(lin(1, 1), lin(1, 1));
    expect(caseOf(same)).toBe('infinite');
    expect(same.spans[0]).toMatchObject({ from: -Infinity, to: Infinity });
  });

  it('löst Parabel = Gerade mit zwei Lösungen, Berührpunkt und ohne Lösung', () => {
    // x² − 1 = 0,5x + 2  ⇔  x² − 0,5x − 3 = 0  ⇒  x = −1,5 oder x = 2
    const s = solveEquation(quad(1, 0, -1), lin(0.5, 2));
    expect(s.roots.map((r) => r.x)).toEqual([-1.5, 2]);
    expect(s.roots.map((r) => r.y)).toEqual([1.25, 3]);
    expect(caseOf(s)).toBe('two');
    // x² = 2x − 1  ⇔  (x − 1)² = 0: Berührpunkt bei x = 1
    const t = solveEquation(quad(1, 0, 0), lin(2, -1));
    expect(t.roots).toHaveLength(1);
    expect(t.roots[0]).toMatchObject({ x: 1, y: 1, touch: true });
    expect(caseOf(t)).toBe('touch');
    // 0,5x² + 2 = x: Diskriminante negativ
    expect(caseOf(solveEquation(quad(0.5, 0, 2), lin(1, 0)))).toBe('none');
  });

  it('gibt irrationale Lösungen exakt mit Wurzeln an', () => {
    const s = solveEquation(quad(1, 0, 0), lin(0, 2));
    expect(s.roots.map((r) => r.x)).toEqual([-Math.SQRT2, Math.SQRT2]);
    expect(s.roots.map((r) => exactText(r.exact!, 'de'))).toEqual(['−√2', '√2']);
    expect(rootText(s.roots[1]!, 'de')).toBe('≈ 1,41');
    // x² = x + 1  ⇒  x = (1 ± √5)/2 (goldener Schnitt)
    const g = solveEquation(quad(1, 0, 0), lin(1, 1));
    expect(g.roots.map((r) => exactText(r.exact!, 'de'))).toEqual(['(1 − √5)/2', '(1 + √5)/2']);
    expect(g.roots[1]!.x).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12);
    // x² = 8 ⇒ ±2√2 (Wurzel teilweise ziehen)
    expect(solveEquation(quad(1, 0, 0), lin(0, 8)).roots.map((r) => exactText(r.exact!, 'en'))).toEqual(['−2√2', '2√2']);
    // Brüche: 3x = 4 ⇒ 4/3
    const f = solveEquation(lin(3, 0), lin(0, 4)).roots[0]!;
    expect(exactText(f.exact!, 'de')).toBe('4/3');
    expect(rootText(f, 'de')).toBe('≈ 1,33');
  });

  it('löst Bruchgleichungen (Hyperbel) ohne die Definitionslücke', () => {
    // 2/(x − 1) = x  ⇔  x² − x − 2 = 0  ⇒  x = −1 oder x = 2
    const s = solveEquation(hyp(2, 1, 0), lin(1, 0));
    expect(s.roots.map((r) => r.x)).toEqual([-1, 2]);
    expect(s.gaps).toEqual([1]);
    // 1/x = −x hat keine Lösung
    expect(caseOf(solveEquation(hyp(1, 0, 0), lin(-1, 0)))).toBe('none');
    // 1/x = x ⇒ ±1
    expect(xs(hyp(1, 0, 0), lin(1, 0))).toEqual([-1, 1]);
    // gleiche Polstelle: 1/x + 1 = 2/x  ⇒  x = 1 (x = 0 ist ausgeschlossen)
    expect(xs(hyp(1, 0, 1), hyp(2, 0, 0))).toEqual([1]);
    // identische Hyperbeln: alle x außer der Polstelle
    const same = solveEquation(hyp(1, 2, 1), hyp(1, 2, 1));
    expect(caseOf(same)).toBe('infinite');
    expect(same.spans).toHaveLength(2);
    expect(same.spans.every((sp) => !sp.fromIn && !sp.toIn)).toBe(true);
  });

  it('löst Hyperbel = Parabel (Gleichung 3. Grades) numerisch', () => {
    // 1/x = x² ⇒ x³ = 1 ⇒ x = 1
    const s = solveEquation(hyp(1, 0, 0), quad(1, 0, 0));
    expect(s.roots).toHaveLength(1);
    expect(s.roots[0]!.x).toBeCloseTo(1, 12);
    // 1/x = x² − 2: drei Lösungen (x³ − 2x − 1 = 0 ⇒ x = −1, (1 ± √5)/2)
    const t = solveEquation(hyp(1, 0, 0), quad(1, 0, -2));
    expect(t.roots.map((r) => r.x)).toHaveLength(3);
    expect(t.roots[0]!.x).toBeCloseTo(-1, 10);
    expect(t.roots[1]!.x).toBeCloseTo((1 - Math.sqrt(5)) / 2, 10);
    expect(t.roots[2]!.x).toBeCloseTo((1 + Math.sqrt(5)) / 2, 10);
    expect(caseOf(t)).toBe('many');
  });

  it('löst Betragsgleichungen stückweise', () => {
    // |x − 1| = 0,5x + 1  ⇒  x = 0 oder x = 4
    expect(xs(abs(1, 1, 0), lin(0.5, 1))).toEqual([0, 4]);
    // |x| = 0: Berühren im Knick
    const k = solveEquation(abs(1, 0, 0), lin(0, 0));
    expect(k.roots).toHaveLength(1);
    expect(k.roots[0]).toMatchObject({ x: 0, touch: true });
    // |x| = x: alle x ≥ 0
    const half = solveEquation(abs(1, 0, 0), lin(1, 0));
    expect(caseOf(half)).toBe('infinite');
    expect(half.spans).toEqual([{ from: 0, to: Infinity, fromIn: true, toIn: false }]);
    // |x| = −|x − 2| + 2: alle x mit 0 ≤ x ≤ 2
    const band = solveEquation(abs(1, 0, 0), abs(-1, 2, 2));
    expect(band.spans).toEqual([{ from: 0, to: 2, fromIn: true, toIn: true }]);
    expect(band.roots).toHaveLength(0);
    // Schnitt genau im Knick: |x − 1| + 1 = x ⇒ für x ≥ 1 identisch? Nein: x − 1 + 1 = x ⇒ alle x ≥ 1
    expect(solveEquation(abs(1, 1, 1), lin(1, 0)).spans[0]).toMatchObject({ from: 1, fromIn: true });
  });

  it('findet Nullstellen von Polynomen bis Grad 3', () => {
    expect(polyRoots([-6, 11, -6, 1]).map((r) => r.x)).toEqual([1, 2, 3].map((v) => expect.closeTo(v, 10)));
    // (x − 1)²(x + 2) = x³ − 3x + 2: doppelte Nullstelle bei 1
    const r = polyRoots([2, -3, 0, 1]);
    expect(r).toHaveLength(2);
    expect(r[1]).toMatchObject({ x: expect.closeTo(1, 6), double: true });
    // x³: dreifache Nullstelle, Vorzeichenwechsel
    expect(polyRoots([0, 0, 0, 1])).toEqual([{ x: 0, double: false }]);
    expect(polyRoots([1, 0, 1])).toEqual([]);
  });

  it('schreibt Terme in Schulschreibweise', () => {
    const t = (f: Fn, lang: 'de' | 'en' = 'de') => partsText(termParts(f, lang));
    expect(t(lin(2, -1))).toBe('2x − 1');
    expect(t(lin(-1, 0))).toBe('−x');
    expect(t(lin(0.5, 2))).toBe('0,5x + 2');
    expect(t(lin(0.5, 2), 'en')).toBe('0.5x + 2');
    expect(t(lin(0, -3))).toBe('−3');
    expect(t(quad(1, 0, -1))).toBe('x² − 1');
    expect(t(quad(-0.5, 1, 3))).toBe('−0,5(x − 1)² + 3');
    expect(t(quad(2, -1.5, 0))).toBe('2(x + 1,5)²');
    expect(t(hyp(2, 1, 0))).toBe('2/(x − 1)');
    expect(t(hyp(-1, 0, 2))).toBe('−1/x + 2');
    expect(t(abs(1, 1, 0))).toBe('|x − 1|');
    expect(t(abs(-2, -1, 3))).toBe('−2|x + 1| + 3');
    expect(isCompound(quad(1, 1, 0))).toBe(false);
    expect(isCompound(lin(2, -1))).toBe(true);
    expect(isCompound(hyp(2, 1, 0))).toBe(false);
    expect(isCompound(abs(-1, 0, 0))).toBe(true);
  });

  it('nähert √2 durch Intervallhalbierung an', () => {
    const f = quad(1, 0, 0);
    const g = lin(0, 2);
    const h = (x: number) => evalFn(f, x) - evalFn(g, x);
    const start = startInterval(h, Math.SQRT2, []);
    expect(start).toEqual({ a: 1, b: 2 });
    let iv = start!;
    const s1 = bisectStep(h, iv);
    expect(s1).toMatchObject({ m: 1.5, keep: 'left' });
    iv = nextInterval(s1);
    expect(iv).toEqual({ a: 1, b: 1.5 });
    for (let i = 0; i < 10; i++) iv = nextInterval(bisectStep(h, iv));
    expect(iv.b - iv.a).toBeCloseTo(0.5 / 1024, 12);
    expect(iv.a).toBeLessThan(Math.SQRT2);
    expect(iv.b).toBeGreaterThan(Math.SQRT2);
    expect(safeDecimals(iv.b - iv.a)).toBe(3);
  });

  it('wählt das Startintervall ohne Polstelle und trifft ganzzahlige Lösungen sofort', () => {
    // 2/(x − 1) = x: Lösung 2, Polstelle 1 darf nicht im Intervall liegen
    const f = hyp(2, 1, 0);
    const g = lin(1, 0);
    const h = (x: number) => evalFn(f, x) - evalFn(g, x);
    const iv = startInterval(h, 2, [1]);
    expect(iv).not.toBeNull();
    expect(iv!.a).toBeGreaterThan(1);
    expect(bisectStep(h, iv!).keep).toBe('hit');
    // Berührpunkt: kein Vorzeichenwechsel, also kein Startintervall
    const k = (x: number) => (x - 1) ** 2;
    expect(startInterval(k, 1, [])).toBeNull();
  });

  it('rundet wie in der Schule und erkennt gesicherte Stellen', () => {
    expect(numText(-1.375, 'de', 2)).toBe('−1,38');
    expect(numText(2.5, 'de', 0)).toBe('3');
    expect(numText(-0.0001, 'de', 2)).toBe('0');
    // [−1,5; −1,375]: noch keine Stelle sicher; [1,4140625; 1,41455078125]: zwei Stellen
    expect(agreedDigits(-1.5, -1.375)).toBe(-1);
    expect(agreedDigits(1.4140625, 1.41455078125)).toBe(2);
    expect(agreedDigits(1.4140625, 1.4150390625)).toBe(1);
  });

  it('setzt Lösungen für die Probe ein', () => {
    const t = (f: Fn, v: string) => partsText(substParts(termParts(f, 'de'), v));
    expect(t(quad(1, 0, -1), '−1,5')).toBe('(−1,5)² − 1');
    expect(t(lin(0.5, 2), '2')).toBe('0,5 · 2 + 2');
    expect(t(hyp(2, 1, 0), '−1')).toBe('2/((−1) − 1)');
    expect(t(abs(1, 1, 0), '0')).toBe('|0 − 1|');
  });

  it('erkennt ganzzahlige Lösungen auch bei Gleichungen 3. Grades exakt', () => {
    const s = solveEquation(hyp(1, 0, 0), quad(1, 0, -2));
    expect(s.roots[0]!.x).toBe(-1);
    expect(rootText(s.roots[0]!, 'de')).toBe('−1');
  });
});
