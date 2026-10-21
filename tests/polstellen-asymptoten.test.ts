import { describe, expect, it } from 'vitest';
import {
  analyze,
  approachTable,
  asymptoteCrossings,
  cancelPairs,
  degree,
  deviation,
  divide,
  divisionSteps,
  evalPoly,
  fromRoots,
  mul,
  poleApprox,
  poleSides,
  realRoots,
  reduce,
  reducedValue,
  signTable,
  symmetry,
  value,
  yIntercept,
  type Poly,
  type Rational,
} from '../src/simulations/mathematik/polstellen-asymptoten/model';

/** Koeffizienten auf 9 Stellen runden (Gleitkomma-Reste). */
const r9 = (p: Poly) => p.map((c) => Math.round(c * 1e9) / 1e9 + 0);

describe('Modell: Polstellen und Asymptoten', () => {
  it('f(x) = (x − 1)/(x + 2): Nullstelle 1, Polstelle −2 mit VZW, Asymptote y = 1', () => {
    const f: Rational = { a: 1, zeros: [1], poles: [-2] };
    const r = analyze(f);
    expect(r.zeros).toEqual([{ x: 1, k: 1 }]);
    expect(r.poles).toEqual([{ x: -2, k: 1, signChange: true }]);
    expect(r.kind).toBe('const');
    expect(r.asym[0]).toBeCloseTo(1, 12);
    expect(poleSides(f, -2)).toEqual({ left: 1, right: -1 });
    expect(value(f, 0)).toBeCloseTo(-0.5, 12);
  });
  it('doppelte Polstelle 1/(x − 1)²: ohne Vorzeichenwechsel, y = 0', () => {
    const f: Rational = { a: 1, zeros: [], poles: [1, 1] };
    const r = analyze(f);
    expect(r.poles).toEqual([{ x: 1, k: 2, signChange: false }]);
    expect(r.kind).toBe('zero');
    expect(poleSides(f, 1)).toEqual({ left: 1, right: 1 });
  });
  it('behebbare Lücke: (x² − 1)/(x − 1) = x + 1 mit Loch bei (1 | 2)', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [1] };
    const r = analyze(f);
    expect(r.holes).toEqual([{ x: 1, y: 2 }]);
    expect(r.poles).toEqual([]);
    expect(r.zeros).toEqual([{ x: -1, k: 1 }]);
    expect(Number.isNaN(value(f, 1))).toBe(true);
    expect(reducedValue(f, 1)).toBe(2);
  });
  it('schräge Asymptote: (x − 1)(x + 1)/(x − 2) = x + 2 + 3/(x − 2)', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [2] };
    const r = analyze(f);
    expect(r.kind).toBe('oblique');
    expect(r.asym).toEqual([2, 1]);
    expect(r.rest).toEqual([3]);
  });
  it('Zählergrad 3, Nennergrad 1: Näherungskurve (Parabel)', () => {
    const r = analyze({ a: 1, zeros: [0, 1, 2], poles: [-1] });
    expect(r.kind).toBe('curve');
    expect(r.asym.length).toBe(3);
  });
  it('Polynomdivision und Auswerten', () => {
    const p = fromRoots(2, [1, 2, 3]);
    expect(p).toEqual([-12, 22, -12, 2]);
    const { q, r } = divide(p, [1, 1]);
    for (const x of [-2, 0.5, 3, 7]) expect(evalPoly(q, x) * (x + 1) + evalPoly(r, x)).toBeCloseTo(evalPoly(p, x), 9);
  });
  it('Plausibilität: f(x) − Asymptote → 0 für große |x| (zufällige Funktionen)', () => {
    for (let i = 0; i < 60; i++) {
      const rnd = () => Math.round((Math.random() * 10 - 5) * 2) / 2;
      const n = 1 + Math.floor(Math.random() * 2);
      const m = Math.floor(Math.random() * (n + 2));
      const f: Rational = { a: 0.5 + Math.floor(Math.random() * 6) / 2, zeros: Array.from({ length: m }, rnd), poles: Array.from({ length: n }, rnd) };
      const r = analyze(f);
      for (const x of [1e6, -1e6]) {
        const d = value(f, x) - evalPoly(r.asym, x);
        expect(Math.abs(d)).toBeLessThan(0.01);
      }
    }
  });
});

describe('Sonderfall a = 0', () => {
  it('Nullfunktion mit Lücke: keine Polstelle, Loch auf der x-Achse', () => {
    const r = analyze({ a: 0, zeros: [1], poles: [-2] });
    expect(r.poles).toEqual([]);
    expect(r.holes).toEqual([{ x: -2, y: 0 }]);
    expect(r.gaps).toEqual([-2]);
  });
  it('Wertetabelle an der Polstelle: (x − 1)/(x + 2) bei x = −2,001 ≈ 3001, bei −1,999 ≈ −2999', () => {
    const f = { a: 1, zeros: [1], poles: [-2] };
    expect(value(f, -2.001)).toBeCloseTo(3001, 6);
    expect(value(f, -1.999)).toBeCloseTo(-2999, 6);
    expect(poleSides(f, -2)).toEqual({ left: 1, right: -1 });
  });
  it('Aus der Ferne: (x² − 1)/(x − 2) = x + 2 + 3/(x − 2), Abstand bei x = 40 nur 3/38', () => {
    const f = { a: 1, zeros: [1, -1], poles: [2] };
    const an = analyze(f);
    expect(an.kind).toBe('oblique');
    expect(an.asym.map((c) => Math.round(c * 1e9) / 1e9)).toEqual([2, 1]);
    expect(value(f, 40) - (40 + 2)).toBeCloseTo(3 / 38, 12);
  });
});

describe('Prüfwerte der Leitung', () => {
  it('Standard (x − 1)/(x + 2): Pol −2 mit VZW, y = 1, Nullstelle 1, f(0) = −0,5', () => {
    const f: Rational = { a: 1, zeros: [1], poles: [-2] };
    const an = analyze(f);
    expect(an.gaps).toEqual([-2]);
    expect(an.poles).toEqual([{ x: -2, k: 1, signChange: true }]);
    expect(an.zeros).toEqual([{ x: 1, k: 1 }]);
    expect(an.kind).toBe('const');
    expect(an.asym).toEqual([1]);
    expect(an.exact).toBe(false);
    expect(yIntercept(f)).toBeCloseTo(-0.5, 12);
    // Division: (x − 1) : (x + 2) = 1 Rest −3, also f(x) = 1 − 3/(x + 2)
    expect(an.rest).toEqual([-3]);
  });
  it('Lücke: (x − 1)(x + 1)/(x − 1) = x + 1 für x ≠ 1, Loch (1 | 2), D = ℝ \\ {1}, keine Polstelle', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [1] };
    const an = analyze(f);
    expect(an.gaps).toEqual([1]);
    expect(an.poles).toEqual([]);
    expect(an.holes).toEqual([{ x: 1, y: 2 }]);
    expect(an.exact).toBe(true);
    expect(r9(an.asym)).toEqual([1, 1]);
    expect(cancelPairs(f)).toEqual([{ zi: 0, pi: 0, x: 1 }]);
    for (const x of [-3, 0, 0.5, 4]) expect(value(f, x)).toBeCloseTo(x + 1, 12);
    // keine Schnittpunkte mit einer „Asymptote“: f ist (bis auf das Loch) die Gerade selbst
    expect(asymptoteCrossings(f)).toEqual([]);
  });
  it('Schief: (x² − 1)/(x − 2) = x + 2 + 3/(x − 2): Asymptote y = x + 2, Pol 2 mit VZW', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [2] };
    const an = analyze(f);
    expect(an.kind).toBe('oblique');
    expect(an.poles).toEqual([{ x: 2, k: 1, signChange: true }]);
    const d = divisionSteps(an.num, an.den);
    expect(r9(d.quotient)).toEqual([2, 1]);
    expect(r9(d.rest)).toEqual([3]);
    // Tafel: x · (x − 2) = x² − 2x abziehen → 2x − 1; 2 · (x − 2) = 2x − 4 abziehen → 3
    expect(d.steps.map((s) => [s.k, s.c])).toEqual([
      [1, 1],
      [0, 2],
    ]);
    expect(r9(d.steps[0]!.sub)).toEqual([0, -2, 1]);
    expect(r9(d.steps[0]!.rem)).toEqual([-1, 2]);
    expect(r9(d.steps[1]!.sub)).toEqual([-4, 2]);
    expect(r9(d.steps[1]!.rem)).toEqual([3]);
    expect(deviation(an, 40)).toBeCloseTo(3 / 38, 12);
  });
  it('Doppelter Pol 2/(x − 1)²: Pol 1 ohne VZW, beidseitig → +∞, Asymptote y = 0', () => {
    const f: Rational = { a: 2, zeros: [], poles: [1, 1] };
    const an = analyze(f);
    expect(an.poles).toEqual([{ x: 1, k: 2, signChange: false }]);
    expect(poleSides(f, 1)).toEqual({ left: 1, right: 1 });
    expect(an.kind).toBe('zero');
    expect(an.asym).toEqual([0]);
    expect(poleApprox(f, 1)).toEqual({ k: 2, c: 2 });
    expect(an.zeros).toEqual([]);
  });
  it('2x/((x + 2)(x − 2)) = 2x/(x² − 4): Pole ±2, y = 0, punktsymmetrisch', () => {
    const f: Rational = { a: 2, zeros: [0], poles: [-2, 2] };
    const an = analyze(f);
    expect(an.poles.map((p) => p.x)).toEqual([-2, 2]);
    expect(an.poles.every((p) => p.signChange)).toBe(true);
    expect(r9(an.den)).toEqual([-4, 0, 1]);
    expect(r9(an.num)).toEqual([0, 2]);
    expect(an.kind).toBe('zero');
    expect(symmetry(f)).toBe('odd');
    expect(symmetry({ a: 2, zeros: [], poles: [1, 1] })).toBe(null);
    expect(symmetry({ a: 1, zeros: [], poles: [-1, 1] })).toBe('even');
  });
  it('0,5(x + 2)x(x − 2)/(x + 1) = 0,5x² − 0,5x − 1,5 + 1,5/(x + 1)', () => {
    const f: Rational = { a: 0.5, zeros: [-2, 0, 2], poles: [-1] };
    const an = analyze(f);
    expect(an.kind).toBe('curve');
    expect(r9(an.num)).toEqual([0, -2, 0, 0.5]);
    expect(r9(an.asym)).toEqual([-1.5, -0.5, 0.5]);
    expect(r9(an.rest)).toEqual([1.5]);
    // Probe: (x² − x − 3)(x + 1) + 3 = x³ − 4x
    expect(r9(mul([-3, -1, 1], [1, 1]).map((c, i) => c + (i === 0 ? 3 : 0)))).toEqual([0, -4, 0, 1]);
    const d = divisionSteps(an.num, an.den);
    expect(d.steps.map((s) => s.c)).toEqual([0.5, -0.5, -1.5]);
    expect(r9(d.rest)).toEqual([1.5]);
  });
  it('(x + 1)(x − 3)/((x + 3)(x − 1)): y = 1, f(0) = 1 – der Graph schneidet die Asymptote', () => {
    const f: Rational = { a: 1, zeros: [-1, 3], poles: [-3, 1] };
    const an = analyze(f);
    expect(an.kind).toBe('const');
    expect(r9(an.asym)).toEqual([1]);
    expect(yIntercept(f)).toBeCloseTo(1, 12);
    // Rest: (x² − 2x − 3) − (x² + 2x − 3) = −4x
    expect(r9(an.rest)).toEqual([0, -4]);
    expect(asymptoteCrossings(f, an)).toEqual([{ x: 0, y: 1 }]);
  });
  it('Zufallsprüfung: s · q + r = p (Polynomdivision Schritt für Schritt)', () => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 300; i++) {
      const dq = 1 + Math.floor(rnd() * 3);
      const dp = Math.floor(rnd() * 5);
      const p: Poly = Array.from({ length: dp + 1 }, () => Math.round((rnd() * 8 - 4) * 2) / 2);
      if (p[dp] === 0) p[dp] = 1;
      const q: Poly = Array.from({ length: dq + 1 }, () => Math.round((rnd() * 8 - 4) * 2) / 2);
      q[dq] = 1 + Math.floor(rnd() * 3);
      const { quotient, rest, steps } = divisionSteps(p, q);
      expect(degree(rest)).toBeLessThan(dq);
      for (const x of [-2.3, -0.7, 0, 1.1, 3.4]) {
        expect(evalPoly(quotient, x) * evalPoly(q, x) + evalPoly(rest, x)).toBeCloseTo(evalPoly(p, x), 8);
      }
      // dasselbe Ergebnis wie die kurze Division
      const short = divide(p, q);
      for (const x of [-1.5, 2]) expect(evalPoly(quotient, x)).toBeCloseTo(evalPoly(short.q, x), 8);
      // jeder Schritt senkt den Grad des Rests
      steps.forEach((s) => expect(degree(s.rem)).toBeLessThan(s.k + dq));
    }
  });
});

describe('Kürzen, Vorzeichen und Annäherung', () => {
  it('Kürzen: (x − 1)²/(x − 1) hat ein Loch bei (1 | 0), (x − 1)/(x − 1)² eine Polstelle mit VZW', () => {
    const a = analyze({ a: 1, zeros: [1, 1], poles: [1] });
    expect(a.holes).toEqual([{ x: 1, y: 0 }]);
    expect(a.zeros).toEqual([]);
    expect(a.poles).toEqual([]);
    const b = analyze({ a: 1, zeros: [1], poles: [1, 1] });
    expect(b.holes).toEqual([]);
    expect(b.poles).toEqual([{ x: 1, k: 1, signChange: true }]);
    expect(reduce({ a: 1, zeros: [1], poles: [1, 1] })).toEqual({ zeros: [], poles: [1], cancelled: [1] });
    expect(cancelPairs({ a: 1, zeros: [2, 1], poles: [1, 3, 1] })).toEqual([{ zi: 1, pi: 0, x: 1 }]);
  });
  it('Vorzeichentabelle von (x − 1)/(x + 2): + | − | +', () => {
    const t = signTable({ a: 1, zeros: [1], poles: [-2] });
    expect(t.xs).toEqual([-2, 1]);
    expect(t.marks).toEqual(['pole', 'zero']);
    expect(t.result).toEqual([1, -1, 1]);
    expect(t.rows.map((r) => r.part)).toEqual(['num', 'den']);
  });
  it('Vorzeichentabelle: kein Wechsel am doppelten Pol, Lücke ändert das Vorzeichen nicht', () => {
    const t = signTable({ a: 2, zeros: [], poles: [1, 1] });
    expect(t.result).toEqual([1, 1]);
    const h = signTable({ a: 1, zeros: [1, -1], poles: [1] });
    expect(h.marks).toEqual(['zero', 'hole']);
    expect(h.result).toEqual([-1, 1, 1]);
    // Vorzeichen stimmt mit Funktionswerten überein
    const f: Rational = { a: -0.5, zeros: [-3, 2], poles: [-1, 0, 4] };
    const s = signTable(f);
    const cuts = [-10, ...s.xs, 10];
    s.result.forEach((sg, k) => expect(Math.sign(value(f, (cuts[k]! + cuts[k + 1]!) / 2))).toBe(sg));
  });
  it('Annäherung an die Polstelle: f(x) ≈ −3/(x + 2), Werte 301 und −299', () => {
    const f: Rational = { a: 1, zeros: [1], poles: [-2] };
    expect(poleApprox(f, -2)).toEqual({ k: 1, c: -3 });
    const t = approachTable(f, -2);
    expect(t[1]!.left.x).toBeCloseTo(-2.01, 12);
    expect(t[1]!.left.y).toBeCloseTo(301, 8);
    expect(t[1]!.right.y).toBeCloseTo(-299, 8);
    expect(t[3]!.left.y).toBeCloseTo(30001, 4);
    // an der Lücke: Annäherung an den Grenzwert 2
    const g: Rational = { a: 1, zeros: [1, -1], poles: [1] };
    const u = approachTable(g, 1);
    expect(u[0]!.left.y).toBeCloseTo(1.9, 12);
    expect(u[3]!.right.y).toBeCloseTo(2.0001, 12);
  });
  it('Schnittpunkte mit der Asymptote und Nullstellen von Polynomen', () => {
    expect(realRoots([-4, 0, 1])).toEqual([-2, 2]);
    expect(realRoots([1, 0, 1])).toEqual([]);
    expect(realRoots([3])).toEqual([]);
    // (x² − 1)/(x − 2): Rest 3 ≠ 0 → kein Schnittpunkt mit y = x + 2
    expect(asymptoteCrossings({ a: 1, zeros: [1, -1], poles: [2] })).toEqual([]);
    // Nullfunktion: nichts
    expect(asymptoteCrossings({ a: 0, zeros: [1], poles: [2] })).toEqual([]);
  });
  it('y-Achsenabschnitt fehlt, wenn 0 eine Definitionslücke ist', () => {
    expect(Number.isNaN(yIntercept({ a: 1, zeros: [1], poles: [0] }))).toBe(true);
    expect(yIntercept({ a: 2, zeros: [], poles: [1, 1] })).toBe(2);
  });
});

describe('Prüfrunde: weitere Sonderfälle', () => {
  it('(x − 1)(x + 1)/((x − 1)(x + 2)): Loch (1 | 2/3), Pol −2 mit VZW, y = 1, Rest −x + 1', () => {
    const f: Rational = { a: 1, zeros: [1, -1], poles: [1, -2] };
    const an = analyze(f);
    expect(an.holes.length).toBe(1);
    expect(an.holes[0]!.x).toBe(1);
    expect(an.holes[0]!.y).toBeCloseTo(2 / 3, 12);
    expect(an.poles).toEqual([{ x: -2, k: 1, signChange: true }]);
    expect(an.zeros).toEqual([{ x: -1, k: 1 }]);
    expect(an.kind).toBe('const');
    expect(r9(an.asym)).toEqual([1]);
    // (x² − 1) − (x² + x − 2) = −x + 1
    expect(r9(an.rest)).toEqual([1, -1]);
    // f(x) = 1 nur bei x = 1 – das ist die Lücke, also kein Schnittpunkt
    expect(asymptoteCrossings(f, an)).toEqual([]);
    expect(yIntercept(f)).toBeCloseTo(0.5, 12);
  });
  it('negatives a: −1/(x − 1)² strebt beidseitig gegen −∞, y = 0', () => {
    const f: Rational = { a: -1, zeros: [], poles: [1, 1] };
    expect(poleSides(f, 1)).toEqual({ left: -1, right: -1 });
    expect(signTable(f).result).toEqual([-1, -1]);
    expect(analyze(f).kind).toBe('zero');
  });
  it('Reglergrenzen: −3/(x − 5)³ hat bei 5 einen dreifachen Pol mit VZW (links +∞, rechts −∞)', () => {
    const f: Rational = { a: -3, zeros: [], poles: [5, 5, 5] };
    const an = analyze(f);
    expect(an.poles).toEqual([{ x: 5, k: 3, signChange: true }]);
    expect(poleSides(f, 5)).toEqual({ left: 1, right: -1 });
    expect(poleApprox(f, 5)).toEqual({ k: 3, c: -3 });
    expect(value(f, 4)).toBeCloseTo(3, 12);
  });
  it('f(0) muss nicht abbrechen: (x − 1)/(x + 3) hat f(0) = −1/3', () => {
    expect(yIntercept({ a: 1, zeros: [1], poles: [-3] })).toBeCloseTo(-1 / 3, 12);
  });
  it('Lücke auf der x-Achse: (x − 1)²/(x − 1) – keine Nullstelle, Loch (1 | 0), Gerade y = x − 1', () => {
    const f: Rational = { a: 1, zeros: [1, 1], poles: [1] };
    const an = analyze(f);
    expect(an.exact).toBe(true);
    expect(r9(an.asym)).toEqual([-1, 1]);
    expect(signTable(f).marks).toEqual(['hole']);
  });
});
