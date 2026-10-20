import { describe, expect, it } from 'vitest';
import {
  changesSign,
  coefForm,
  decimalPlaces,
  degree,
  endBehaviour,
  evalPoly,
  evaluate,
  expand,
  expandExact,
  expandSteps,
  leadingRatio,
  localApprox,
  localShape,
  mergeRoots,
  rangeOn,
  ratValue,
  reduce,
  relevantInterval,
  sciSplit,
  signChart,
  signTable,
  toRational,
  yIntercept,
  zeroKind,
  type Root,
} from '../src/simulations/mathematik/ganzrationale-funktionen/model';

describe('Modell: Ganzrationale Funktionen', () => {
  it('Ausmultiplizieren: 0,5 · (x + 2)(x − 0,5)(x − 3)', () => {
    const c = expand(0.5, [
      { x: -2, m: 1 },
      { x: 0.5, m: 1 },
      { x: 3, m: 1 },
    ]);
    // 0,5x³ − 0,75x² − 2,75x + 1,5
    expect(c[3]).toBeCloseTo(0.5, 12);
    expect(c[2]).toBeCloseTo(-0.75, 12);
    expect(c[1]).toBeCloseTo(-2.75, 12);
    expect(c[0]).toBeCloseTo(1.5, 12);
  });
  it('Normalform und Linearfaktoren liefern dieselben Werte', () => {
    const roots = [
      { x: 1, m: 3 },
      { x: -3, m: 1 },
    ];
    const c = expand(0.3, roots);
    for (const x of [-4, -1.5, 0, 2.2, 5]) {
      const v = c.reduce((s, k, i) => s + k * x ** i, 0);
      expect(v).toBeCloseTo(evaluate(0.3, roots, x), 9);
    }
    expect(degree(roots)).toBe(4);
  });
  it('Art der Nullstelle nach Vielfachheit', () => {
    expect(zeroKind(1)).toBe('cross');
    expect(zeroKind(2)).toBe('touch');
    expect(zeroKind(3)).toBe('terrace');
    expect(zeroKind(4)).toBe('touch');
  });
  it('Randverhalten', () => {
    expect(endBehaviour(0.5, 3)).toEqual({ left: -1, right: 1 });
    expect(endBehaviour(-1, 3)).toEqual({ left: 1, right: -1 });
    expect(endBehaviour(2, 4)).toEqual({ left: 1, right: 1 });
    expect(endBehaviour(-2, 2)).toEqual({ left: -1, right: -1 });
  });
  it('Zusammenfallende Nullstellen addieren ihre Vielfachheit', () => {
    const m = mergeRoots([
      { x: 1, m: 1 },
      { x: -2, m: 1 },
      { x: 1, m: 2 },
    ]);
    expect(m).toEqual([
      { x: -2, m: 1 },
      { x: 1, m: 3 },
    ]);
  });
  it('Vorzeichentabelle: kein Wechsel an doppelten Nullstellen', () => {
    const s = signChart(0.2, [
      { x: -3, m: 1 },
      { x: 0, m: 2 },
      { x: 3, m: 1 },
    ]);
    expect(s).toEqual([1, -1, -1, 1]);
    // Stichproben
    const f = (x: number) => evaluate(0.2, [{ x: -3, m: 1 }, { x: 0, m: 2 }, { x: 3, m: 1 }], x);
    expect(Math.sign(f(-4))).toBe(1);
    expect(Math.sign(f(-1))).toBe(-1);
    expect(Math.sign(f(1))).toBe(-1);
    expect(Math.sign(f(4))).toBe(1);
  });
});

const R1: Root[] = [
  { x: -2, m: 1 },
  { x: 0.5, m: 1 },
  { x: 3, m: 1 },
];
const R2: Root[] = [
  { x: -2, m: 2 },
  { x: 2, m: 1 },
];
const R3: Root[] = [
  { x: -3, m: 1 },
  { x: 0, m: 2 },
  { x: 3, m: 1 },
];
const asDec = (r: { n: number; d: number }) => r.n / r.d;
/** reproduzierbarer Zufall (Park-Miller) */
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

describe('Prüfwerte der Leitung', () => {
  it('0,5·(x + 2)(x − 0,5)(x − 3) = 0,5x³ − 0,75x² − 2,75x + 1,5 (exakt), f(0) = 1,5', () => {
    const c = expandExact(0.5, R1);
    expect(c).toEqual([
      { n: 3, d: 2 },
      { n: -11, d: 4 },
      { n: -3, d: 4 },
      { n: 1, d: 2 },
    ]);
    expect(c.map((r) => coefForm(r))).toEqual([
      { dec: 1.5, places: 1 },
      { dec: -2.75, places: 2 },
      { dec: -0.75, places: 2 },
      { dec: 0.5, places: 1 },
    ]);
    expect(yIntercept(0.5, R1)).toBeCloseTo(1.5, 12);
  });
  it('0,5·(x + 2)²(x − 2) = 0,5x³ + x² − 2x − 4; f(1) = −4,5; Berührpunkt bei −2', () => {
    expect(expandExact(0.5, R2).map(asDec)).toEqual([-4, -2, 1, 0.5]);
    expect(evaluate(0.5, R2, 1)).toBeCloseTo(-4.5, 12);
    expect(zeroKind(2)).toBe('touch');
    expect(changesSign(2)).toBe(false);
    // kein Vorzeichenwechsel bei −2: links und rechts negativ
    expect(Math.sign(evaluate(0.5, R2, -2.01))).toBe(-1);
    expect(Math.sign(evaluate(0.5, R2, -1.99))).toBe(-1);
    expect(signChart(0.5, R2)).toEqual([-1, -1, 1]);
  });
  it('0,2·(x + 3)·x²·(x − 3) = 0,2x⁴ − 1,8x²; f(1) = −1,6; + | − | − | +; beide Enden +∞', () => {
    expect(expandExact(0.2, R3)).toEqual([
      { n: 0, d: 1 },
      { n: 0, d: 1 },
      { n: -9, d: 5 },
      { n: 0, d: 1 },
      { n: 1, d: 5 },
    ]);
    expect(evaluate(0.2, R3, 1)).toBeCloseTo(-1.6, 12);
    expect(signTable(0.2, R3).result).toEqual([1, -1, -1, 1]);
    expect(endBehaviour(0.2, degree(R3))).toEqual({ left: 1, right: 1 });
  });
  it('a < 0, Grad 3: x → −∞: f → +∞; x → +∞: f → −∞', () => {
    expect(endBehaviour(-0.4, 3)).toEqual({ left: 1, right: -1 });
    const roots: Root[] = [
      { x: -3, m: 1 },
      { x: -0.5, m: 1 },
      { x: 2.5, m: 1 },
    ];
    expect(evaluate(-0.4, roots, -1000)).toBeGreaterThan(0);
    expect(evaluate(-0.4, roots, 1000)).toBeLessThan(0);
  });
  it('lokale Näherung an der doppelten Nullstelle 0: f(x) ≈ −1,8·x²', () => {
    const i = mergeRoots(R3).findIndex((r) => r.x === 0);
    const loc = localApprox(0.2, R3, i);
    expect(loc.m).toBe(2);
    expect(loc.c).toBeCloseTo(0.2 * (0 + 3) * (0 - 3), 12);
    expect(loc.c).toBeCloseTo(-1.8, 12);
    expect(localShape(loc.m)).toBe('parabola');
    // je näher an 0, desto besser: f(x) / (c·x²) → 1
    for (const h of [0.1, 0.01, 0.001]) expect(Math.abs(evaluate(0.2, R3, h) / (loc.c * h * h) - 1)).toBeLessThan(h * h);
  });
  it('f(x)/(a·xⁿ) bei x = 100 im ersten Beispiel: 1,02 · 0,995 · 0,97 = 0,984453', () => {
    expect(leadingRatio(R1, 100)).toBeCloseTo(1.02 * 0.995 * 0.97, 12);
    expect(leadingRatio(R1, 100)).toBeCloseTo(0.984453, 12);
    expect(evaluate(0.5, R1, 100) / (0.5 * 100 ** 3)).toBeCloseTo(0.984453, 12);
    expect(Math.abs(leadingRatio(R1, 1e6) - 1)).toBeLessThan(1e-5);
  });
});

describe('Vorzeichentabelle mit Zeilen für die Faktoren', () => {
  it('Faktorzeilen: links von x₀ (−1)^m, rechts +', () => {
    const t = signTable(0.5, R2);
    expect(t.zeros).toEqual([
      { x: -2, m: 2 },
      { x: 2, m: 1 },
    ]);
    expect(t.rows[0]!.signs).toEqual([1, 1, 1]);
    expect(t.rows[1]!.signs).toEqual([-1, -1, 1]);
    expect(t.lead).toBe(1);
    expect(t.result).toEqual([-1, -1, 1]);
  });
  it('stimmt für viele Zufallswerte mit signChart und mit Stichproben überein', () => {
    const rnd = rng(7);
    for (let k = 0; k < 300; k++) {
      const z = 1 + Math.floor(rnd() * 3);
      const roots: Root[] = Array.from({ length: z }, () => ({ x: Math.round((rnd() * 8 - 4) * 2) / 2, m: 1 + Math.floor(rnd() * 4) }));
      const a = (rnd() < 0.5 ? -1 : 1) * (0.1 + Math.round(rnd() * 29) / 10);
      const t = signTable(a, roots);
      expect(t.result).toEqual(signChart(a, roots));
      const xs = t.zeros.map((r) => r.x);
      const mids = [xs[0]! - 1, ...xs.slice(0, -1).map((x, i) => (x + xs[i + 1]!) / 2), xs[xs.length - 1]! + 1];
      mids.forEach((x, i) => expect(Math.sign(evaluate(a, roots, x))).toBe(t.result[i]));
    }
  });
});

describe('Sonderfälle', () => {
  it('alle Nullstellen fallen zusammen: 0,5·(x − 1)⁴', () => {
    const roots: Root[] = [
      { x: 1, m: 1 },
      { x: 1, m: 2 },
      { x: 1, m: 1 },
    ];
    expect(mergeRoots(roots)).toEqual([{ x: 1, m: 4 }]);
    expect(degree(roots)).toBe(4);
    // 0,5·(x − 1)⁴ = 0,5x⁴ − 2x³ + 3x² − 2x + 0,5
    expect(expandExact(0.5, roots).map(asDec)).toEqual([0.5, -2, 3, -2, 0.5]);
    expect(signTable(0.5, roots).result).toEqual([1, 1]);
    expect(localApprox(0.5, roots, 0)).toEqual({ x0: 1, m: 4, c: 0.5 });
  });
  it('Vielfachheiten addieren sich (Grad 12)', () => {
    const roots: Root[] = [
      { x: -1, m: 4 },
      { x: 2, m: 4 },
      { x: -1, m: 4 },
    ];
    expect(mergeRoots(roots)).toEqual([
      { x: -1, m: 8 },
      { x: 2, m: 4 },
    ]);
    expect(degree(roots)).toBe(12);
    expect(expandExact(1, roots)[12]).toEqual({ n: 1, d: 1 });
  });
  it('Grad 1: Gerade mit einfacher Nullstelle', () => {
    expect(expandExact(1.5, [{ x: 1, m: 1 }]).map(asDec)).toEqual([-1.5, 1.5]);
    expect(endBehaviour(1.5, 1)).toEqual({ left: -1, right: 1 });
    expect(localShape(1)).toBe('line');
  });
  it('dreifache Nullstelle: Terrassenpunkt mit Vorzeichenwechsel, Näherung kubisch', () => {
    const roots: Root[] = [
      { x: 1, m: 3 },
      { x: -3, m: 1 },
    ];
    expect(zeroKind(3)).toBe('terrace');
    expect(changesSign(3)).toBe(true);
    const i = mergeRoots(roots).findIndex((r) => r.x === 1);
    expect(localApprox(0.3, roots, i).c).toBeCloseTo(0.3 * 4, 12);
    expect(localShape(3)).toBe('cubic');
    // 0,3·(x − 1)³(x + 3) = 0,3x⁴ − 1,8x² + 2,4x − 0,9
    expect(expandExact(0.3, roots).map(asDec)).toEqual([-0.9, 2.4, -1.8, 0, 0.3]);
  });
});

describe('Exakte Brüche und Darstellung', () => {
  it('toRational, reduce, decimalPlaces, coefForm', () => {
    expect(toRational(0.1 + 0.2)).toEqual({ n: 3, d: 10 });
    expect(toRational(-2.5)).toEqual({ n: -5, d: 2 });
    expect(reduce(6, -8)).toEqual({ n: -3, d: 4 });
    expect(decimalPlaces({ n: 3, d: 8 })).toBe(3);
    expect(decimalPlaces({ n: 1, d: 3 })).toBeNull();
    expect(coefForm({ n: 1, d: 4096 })).toEqual({ num: 1, den: 4096 });
    expect(ratValue({ n: -11, d: 4 })).toBe(-2.75);
  });
  it('Zufallsprüfung: Normalform (Gleitkomma und exakt) = Linearfaktoren', () => {
    const rnd = rng(42);
    for (let k = 0; k < 400; k++) {
      const z = 1 + Math.floor(rnd() * 3);
      const roots: Root[] = Array.from({ length: z }, () => ({ x: Math.round((rnd() * 8 - 4) * 2) / 2, m: 1 + Math.floor(rnd() * 4) }));
      const a = Math.round((rnd() * 6 - 3) * 10) / 10 || 0.1;
      const c = expand(a, roots);
      const ce = expandExact(a, roots).map(ratValue);
      expect(c.length).toBe(degree(roots) + 1);
      for (let i = 0; i < 6; i++) {
        const x = rnd() * 10 - 5;
        const v = evaluate(a, roots, x);
        const tol = 1e-6 * Math.max(1, Math.abs(v));
        expect(Math.abs(evalPoly(c, x) - v)).toBeLessThan(tol);
        expect(Math.abs(evalPoly(ce, x) - v)).toBeLessThan(tol);
      }
      expect(ce[ce.length - 1]).toBeCloseTo(a, 12);
      expect(ce[0]).toBeCloseTo(yIntercept(a, roots), 9);
    }
  });
  it('Ausmultiplizieren Schritt für Schritt endet bei der Normalform', () => {
    const steps = expandSteps(0.5, R1);
    expect(steps.length).toBe(4);
    // (x + 2)(x − 0,5) = x² + 1,5x − 1
    expect(steps[1]!.coeffs.map(asDec)).toEqual([-1, 1.5, 1]);
    expect(steps[3]!.withA).toBe(true);
    expect(steps[3]!.coeffs).toEqual(expandExact(0.5, R1));
    expect(expandSteps(1, R1).length).toBe(3);
  });
});

describe('Hilfen für den Bildausschnitt', () => {
  it('relevanter Bereich, Wertebereich, Zehnerpotenzen', () => {
    expect(relevantInterval(R1)).toEqual([-2.8, 3.8]);
    const r = rangeOn((x) => x * x - 1, -2, 2, 400);
    expect(r.lo).toBeCloseTo(-1, 9);
    expect(r.hi).toBeCloseTo(3, 9);
    expect(sciSplit(2500000)).toEqual({ mant: 2.5, exp: 6 });
    const s = sciSplit(-0.004);
    expect(s.exp).toBe(-3);
    expect(s.mant).toBeCloseTo(-4, 12);
  });
});
