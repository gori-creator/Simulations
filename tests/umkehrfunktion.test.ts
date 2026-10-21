import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  clampA,
  distToDiagonal,
  foldPoint,
  footOnDiagonal,
  inDomain,
  inSet,
  invSlopeAt,
  levelHits,
  localize,
  makeFn,
  monoPieces,
  mirror,
  mirrorPath,
  partner,
  repeatedValues,
  sampleGraph,
  slopeTriangle,
  startA,
  stepsOf,
  valueTable,
  type DomKey,
  type FnKey,
} from '../src/simulations/mathematik/umkehrfunktion/model';

/** Alle umkehrbaren Fälle der Simulation. */
const INVERTIBLE: [FnKey, DomKey][] = [
  ['lin', 'all'],
  ['sq', 'pos'],
  ['sq', 'neg'],
  ['cube', 'all'],
  ['exp', 'all'],
  ['hyp', 'all'],
  ['sin', 'pos'],
  ['sin', 'neg'],
];
const ALL: [FnKey, DomKey][] = [...INVERTIBLE, ['sq', 'all'], ['sin', 'all']];

describe('Modell: Umkehrfunktionen – Prüfwerte', () => {
  it('f(x) = 2x − 1: f⁻¹(x) = (x + 1) : 2; f(3) = 5, f⁻¹(5) = 3; Steigungen 2 und 0,5', () => {
    const fn = makeFn('lin');
    expect(fn.f(3)).toBe(5);
    expect(fn.inv!(5)).toBe(3);
    expect(fn.inv!(3)).toBe(2);
    expect(fn.df(3)).toBe(2);
    expect(invSlopeAt(fn, 3)).toBe(0.5);
    expect(fn.dinv!(5)).toBe(0.5);
  });

  it('f(x) = x², x ≥ 0: f⁻¹(x) = √x; f(1,5) = 2,25; f′(1,5) = 3; (f⁻¹)′(2,25) = 1/3', () => {
    const fn = makeFn('sq', 'pos');
    expect(fn.f(1.5)).toBe(2.25);
    expect(fn.inv!(2.25)).toBe(1.5);
    expect(fn.inv!(4)).toBe(2);
    expect(fn.df(1.5)).toBe(3);
    expect(invSlopeAt(fn, 1.5)).toBeCloseTo(1 / 3, 14);
    expect(fn.dinv!(2.25)).toBeCloseTo(1 / (2 * Math.sqrt(2.25)), 14);
    expect(fn.dinv!(2.25)).toBeCloseTo(1 / 3, 14);
  });

  it('f(x) = x², x ≤ 0: f⁻¹(x) = −√x', () => {
    const fn = makeFn('sq', 'neg');
    expect(fn.inv!(4)).toBe(-2);
    expect(fn.inv!(2.25)).toBe(-1.5);
    expect(fn.mono).toBe('dec');
    expect(invSlopeAt(fn, -1.5)).toBeCloseTo(-1 / 3, 14);
    expect(fn.dinv!(2.25)).toBeCloseTo(-1 / 3, 14);
  });

  it('x² auf ganz ℝ ist nicht umkehrbar: f(−2) = f(2) = 4, die waagrechte Gerade y = 4 schneidet zweimal', () => {
    const fn = makeFn('sq', 'all');
    expect(fn.inv).toBeNull();
    expect(fn.f(-2)).toBe(4);
    expect(fn.f(2)).toBe(4);
    expect(partner('sq', 'all', 2)).toBe(-2);
    expect(partner('sq', 'all', -1.5)).toBe(1.5);
    expect(partner('sq', 'pos', 2)).toBeNull();
    expect(levelHits(fn, 4, -5, 5)).toEqual([-2, 2]);
    // eingeschränkt: nur noch ein Schnittpunkt
    expect(levelHits(makeFn('sq', 'pos'), 4, -5, 5)).toEqual([2]);
    expect(levelHits(makeFn('sq', 'neg'), 4, -5, 5)).toEqual([-2]);
    // Scheitel: genau ein Schnittpunkt, darunter keiner
    expect(levelHits(fn, 0, -5, 5)).toEqual([0]);
    expect(levelHits(fn, -1, -5, 5)).toEqual([]);
  });

  it('f(x) = 0,5x³: f⁻¹(x) = ∛(2x); f(2) = 4, f⁻¹(4) = 2; f′(0) = 0 → senkrechte Tangente von f⁻¹ in (0 | 0)', () => {
    const fn = makeFn('cube');
    expect(fn.f(2)).toBe(4);
    expect(fn.inv!(4)).toBeCloseTo(2, 14);
    expect(fn.inv!(-4)).toBeCloseTo(-2, 14);
    expect(fn.df(0)).toBe(0);
    expect(Math.abs(invSlopeAt(fn, 0))).toBe(Infinity);
    expect(fn.dinv!(0)).toBe(Infinity);
    // streng monoton trotz f′(0) = 0
    expect(fn.mono).toBe('inc');
    expect(levelHits(fn, 0, -5, 5)).toEqual([0]);
    // (f⁻¹)′(4) = 1 / f′(2) = 1/6
    expect(fn.dinv!(4)).toBeCloseTo(1 / 6, 14);
  });

  it('f(x) = eˣ: f⁻¹(x) = ln x, D(f⁻¹) = ℝ⁺; ln e = 1; (ln)′(e) = 1/e ≈ 0,3679', () => {
    const fn = makeFn('exp');
    expect(fn.inv!(Math.E)).toBeCloseTo(1, 14);
    expect(fn.inv!(1)).toBe(0);
    expect(Number.isNaN(fn.inv!(0))).toBe(true);
    expect(Number.isNaN(fn.inv!(-1))).toBe(true);
    expect(inSet(fn.W, 0)).toBe(false);
    expect(inSet(fn.W, 1e-9)).toBe(true);
    expect(invSlopeAt(fn, 1)).toBeCloseTo(1 / Math.E, 14);
    expect(fn.dinv!(Math.E)).toBeCloseTo(0.3679, 4);
    // (ln x)′ = 1/x über die Spiegelung: 1 / e^(ln x) = 1/x
    for (const y of [0.5, 1, 2, 4]) expect(invSlopeAt(fn, Math.log(y))).toBeCloseTo(1 / y, 13);
  });

  it('f(x) = 1/x ist zu sich selbst invers (Graph symmetrisch zu y = x)', () => {
    const fn = makeFn('hyp');
    expect(fn.selfInverse).toBe(true);
    for (const x of [-3, -0.5, 0.25, 2, 4]) {
      expect(fn.inv!(x)).toBeCloseTo(fn.f(x), 14);
      // Spiegelpunkt liegt wieder auf dem Graphen von f
      const [u, v] = mirror([x, fn.f(x)]);
      expect(fn.f(u)).toBeCloseTo(v, 12);
    }
    expect(inDomain(fn, 0)).toBe(false);
    // auf ganz D nicht monoton, trotzdem umkehrbar (Monotonie ist hinreichend, nicht notwendig)
    expect(fn.mono).toBe('decPieces');
    expect(levelHits(fn, 0, -5, 5)).toEqual([]);
    expect(levelHits(fn, 2, -5, 5)).toEqual([0.5]);
  });

  it('sin x eingeschränkt (Ausblick): arcsin bzw. π − arcsin; auf ℝ nicht umkehrbar', () => {
    const pos = makeFn('sin', 'pos');
    expect(pos.inv!(0.5)).toBeCloseTo(Math.PI / 6, 14);
    expect(pos.inv!(1)).toBeCloseTo(Math.PI / 2, 14);
    expect(pos.dinv!(0.5)).toBeCloseTo(1 / Math.cos(Math.PI / 6), 14);
    const neg = makeFn('sin', 'neg');
    expect(neg.inv!(0.5)).toBeCloseTo((5 * Math.PI) / 6, 14);
    expect(neg.inv!(-1)).toBeCloseTo((3 * Math.PI) / 2, 14);
    const all = makeFn('sin', 'all');
    expect(all.inv).toBeNull();
    const hits = levelHits(all, 0.5, -2, 5);
    expect(hits.length).toBe(2);
    expect(hits[0]).toBeCloseTo(Math.PI / 6, 14);
    expect(hits[1]).toBeCloseTo((5 * Math.PI) / 6, 14);
    expect(levelHits(all, 0, -7, 7).length).toBe(5);
    expect(partner('sin', 'all', 0.5)).toBeCloseTo(Math.PI - 0.5, 12);
  });
});

describe('Modell: Spiegelung an y = x', () => {
  it('tauscht die Koordinaten; Mittelpunkt auf y = x; Verbindung senkrecht zu y = x', () => {
    expect(mirror([3, 5])).toEqual([5, 3]);
    expect(mirror([1.5, 2.25])).toEqual([2.25, 1.5]);
    const m = mirrorPath([1, 3], 0.5);
    expect(m[0]).toBe(m[1]);
    expect(footOnDiagonal([1, 3])).toEqual([2, 2]);
    // Richtung P → P′ ist (b − a, a − b), Skalarprodukt mit (1, 1) ist 0
    const P: [number, number] = [3, 5];
    const Q = mirror(P);
    expect((Q[0] - P[0]) * 1 + (Q[1] - P[1]) * 1).toBe(0);
    expect(distToDiagonal(P)).toBeCloseTo(Math.SQRT2, 14);
    expect(distToDiagonal(Q)).toBeCloseTo(Math.SQRT2, 14);
  });

  it('Umklappen im Raum: Start P, Mitte über y = x (Höhe = Abstand), Ende P′; Abstand zur Achse bleibt', () => {
    const P: [number, number] = [1.5, 2.25];
    const d = distToDiagonal(P);
    const s = foldPoint(P, 0);
    expect(s.x).toBeCloseTo(1.5, 14);
    expect(s.y).toBeCloseTo(2.25, 14);
    expect(s.z).toBeCloseTo(0, 14);
    const mid = foldPoint(P, 0.5);
    expect(mid.x).toBeCloseTo(mid.y, 14);
    expect(mid.z).toBeCloseTo(d, 14);
    const e = foldPoint(P, 1);
    expect(e.x).toBeCloseTo(2.25, 14);
    expect(e.y).toBeCloseTo(1.5, 14);
    expect(e.z).toBeCloseTo(0, 12);
    const rnd = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const p: [number, number] = [rnd() * 10 - 5, rnd() * 10 - 5];
      const t = rnd();
      const q = foldPoint(p, t);
      const [mx, my] = footOnDiagonal(p);
      // Lotfußpunkt bleibt, Abstand im Raum bleibt
      expect(Math.hypot(q.x - mx, q.y - my, q.z)).toBeCloseTo(distToDiagonal(p), 10);
      expect(q.x + q.y).toBeCloseTo(p[0] + p[1], 10);
    }
  });

  it('Steigungsdreieck: beim Spiegeln tauschen die Katheten, die Steigung wird zum Kehrwert', () => {
    const fn = makeFn('sq', 'pos');
    const a = 1.5;
    const m = fn.df(a);
    const tri = slopeTriangle(a, fn.f(a), m, 0.4);
    const P2 = mirror(tri.P);
    const Q2 = mirror(tri.Q);
    const C2 = mirror(tri.C);
    // gespiegelte waagrechte Kathete ist senkrecht und umgekehrt
    expect(C2[0]).toBeCloseTo(P2[0], 14);
    expect(Q2[1]).toBeCloseTo(C2[1], 14);
    expect((Q2[1] - P2[1]) / (Q2[0] - P2[0])).toBeCloseTo(1 / m, 13);
  });
});

describe('Modell: Definitions- und Wertemengen, Tabelle, Rechenweg', () => {
  it('D und W tauschen die Rollen: x aus D_f liefert f(x) in W_f, f⁻¹ bildet W_f auf D_f ab', () => {
    const rnd = seededRandom(3);
    for (const [k, d] of INVERTIBLE) {
      const fn = makeFn(k, d);
      for (let i = 0; i < 100; i++) {
        const x = fn.pRange[0] + rnd() * (fn.pRange[1] - fn.pRange[0]);
        if (!inDomain(fn, x)) continue;
        const y = fn.f(x);
        expect(inSet(fn.W, y)).toBe(true);
        expect(inDomain(fn, fn.inv!(y))).toBe(true);
      }
    }
  });

  it('Wertetabelle: Zahlen stimmen, gleiche Funktionswerte nur bei den nicht umkehrbaren Fällen', () => {
    expect(valueTable(makeFn('lin')).map((r) => r.y)).toEqual([-3, -1, 1, 3, 5]);
    expect(valueTable(makeFn('sq', 'pos')).map((r) => r.y)).toEqual([0, 0.25, 1, 2.25, 4]);
    expect(valueTable(makeFn('cube')).map((r) => r.y)).toEqual([-4, -0.5, 0, 0.5, 4]);
    const sinRows = valueTable(makeFn('sin', 'pos'));
    expect(sinRows.every((r) => r.pi)).toBe(true);
    expect(sinRows.map((r) => Math.round(r.y * 1e12) / 1e12)).toEqual([-1, -0.5, 0, 0.5, 1]);
    for (const [k, d] of ALL) {
      const rows = valueTable(makeFn(k, d));
      expect(rows.length).toBe(5);
      expect(rows.every((r) => inDomain(makeFn(k, d), r.x))).toBe(true);
      expect(repeatedValues(rows) !== null).toBe(makeFn(k, d).inv === null);
    }
    expect(repeatedValues(valueTable(makeFn('sq', 'all')))).toEqual([0, 4]);
  });

  it('Rechenweg vorhanden; ohne Umkehrfunktion kein Ergebnis; englische Schreibweise', () => {
    for (const [k, d] of ALL) {
      const s = stepsOf(k, d, 'de');
      expect(s.solve.length).toBeGreaterThan(1);
      expect(s.inv === '').toBe(makeFn(k, d).inv === null);
      expect(s.dinv === '').toBe(makeFn(k, d).inv === null);
    }
    expect(stepsOf('cube', 'all', 'en').f).toBe('f(x) = 0.5x³');
    expect(stepsOf('sin', 'pos', 'en').W).toBe('[−1, 1]');
    expect(stepsOf('sin', 'pos', 'de').W).toBe('[−1; 1]');
    expect(localize('f′(x) = 1,5x²', 'en')).toBe('f′(x) = 1.5x²');
  });

  it('Startwerte und Bereich von P: im Definitionsbereich, Punkt und Spiegelpunkt im Bild', () => {
    for (const [k, d] of ALL) {
      const fn = makeFn(k, d);
      const a = startA(k, d);
      expect(clampA(fn, a)).toBe(a);
      for (const x of [fn.pRange[0], fn.pRange[1], a]) {
        const c = clampA(fn, x);
        expect(inDomain(fn, c)).toBe(true);
        const y = fn.f(c);
        expect(y).toBeGreaterThanOrEqual(fn.window[0]);
        expect(y).toBeLessThanOrEqual(fn.window[1]);
        expect(c).toBeGreaterThanOrEqual(fn.window[0]);
        expect(c).toBeLessThanOrEqual(fn.window[1]);
      }
    }
    expect(clampA(makeFn('hyp'), 0.1)).toBe(0.3);
    expect(clampA(makeFn('hyp'), -0.1)).toBe(-0.3);
    expect(clampA(makeFn('sq', 'pos'), -1)).toBe(0);
    // sin(2,6) liegt auf dem fallenden Ast
    expect(inDomain(makeFn('sin', 'neg'), startA('sin', 'neg'))).toBe(true);
  });
});

describe('Modell: Monotonie', () => {
  it('x² zerfällt in einen fallenden und einen steigenden Ast; 0,5x³ bleibt ein steigendes Stück', () => {
    const sq = monoPieces(makeFn('sq', 'pos'), -3, 5);
    expect(sq.map((q) => [q.lo, q.hi, q.dir, q.used])).toEqual([
      [-3, 0, 'dec', false],
      [0, 5, 'inc', true],
    ]);
    expect(monoPieces(makeFn('cube'), -4, 4)).toEqual([{ lo: -4, hi: 4, dir: 'inc', used: true }]);
    expect(monoPieces(makeFn('hyp'), -4, 4).map((q) => q.dir)).toEqual(['dec', 'dec']);
    const sin = monoPieces(makeFn('sin', 'pos'), -2.4, 2.4);
    expect(sin.map((q) => q.dir)).toEqual(['dec', 'inc', 'dec']);
    expect(sin.map((q) => q.used)).toEqual([false, true, false]);
    expect(sin[1]!.lo).toBeCloseTo(-Math.PI / 2, 14);
  });
});

describe('Modell: Plausibilität über viele Zufallswerte', () => {
  it('f⁻¹(f(x)) = x auf D_f und f(f⁻¹(y)) = y auf W_f; Spiegelpunkt (b | a) liegt auf dem Graphen von f⁻¹', () => {
    const rnd = seededRandom(2026);
    for (const [k, d] of INVERTIBLE) {
      const fn = makeFn(k, d);
      for (let i = 0; i < 300; i++) {
        const x = fn.pRange[0] + rnd() * (fn.pRange[1] - fn.pRange[0]);
        if (!inDomain(fn, x) || (fn.gap !== undefined && Math.abs(x) < 1e-3)) continue;
        const b = fn.f(x);
        expect(fn.inv!(b)).toBeCloseTo(x, 9);
        const [u, v] = mirror([x, b]);
        expect(fn.inv!(u)).toBeCloseTo(v, 9);
        expect(fn.f(fn.inv!(b))).toBeCloseTo(b, 9);
      }
    }
  });

  it('(f⁻¹)′(b) = 1 / f′(a) stimmt mit der geschlossenen Ableitung und dem Differenzenquotienten überein', () => {
    const rnd = seededRandom(11);
    for (const [k, d] of INVERTIBLE) {
      const fn = makeFn(k, d);
      for (let i = 0; i < 120; i++) {
        const a = fn.pRange[0] + rnd() * (fn.pRange[1] - fn.pRange[0]);
        if (!inDomain(fn, a) || Math.abs(fn.df(a)) < 0.05 || (fn.gap !== undefined && Math.abs(a) < 0.3)) continue;
        if (k === 'sq' && Math.abs(a) < 0.05) continue;
        const b = fn.f(a);
        const s = invSlopeAt(fn, a);
        expect(fn.dinv!(b)).toBeCloseTo(s, 7);
        const h = 1e-6;
        const dq = (fn.inv!(b + h) - fn.inv!(b - h)) / (2 * h);
        expect(Math.abs(dq - s)).toBeLessThan(1e-4 * Math.max(1, Math.abs(s)));
      }
    }
  });

  it('waagrechte Gerade: umkehrbare Fälle höchstens ein Schnittpunkt, jeder Treffer erfüllt f(x) = c', () => {
    const rnd = seededRandom(5);
    for (const [k, d] of ALL) {
      const fn = makeFn(k, d);
      const [lo, hi] = fn.window;
      let maxHits = 0;
      for (let i = 0; i < 300; i++) {
        const c = lo + rnd() * (hi - lo);
        const hits = levelHits(fn, c, lo, hi);
        maxHits = Math.max(maxHits, hits.length);
        for (const x of hits) expect(fn.f(x)).toBeCloseTo(c, 10);
        if (fn.inv) expect(hits.length).toBeLessThanOrEqual(1);
      }
      if (!fn.inv) expect(maxHits).toBeGreaterThanOrEqual(2);
    }
  });

  it('Abtasten: alle Punkte liegen auf dem Graphen, im Bereich und im Definitionsbereich; 1/x in zwei Ästen', () => {
    for (const [k, d] of ALL) {
      const fn = makeFn(k, d);
      const [lo, hi] = fn.window;
      const parts = sampleGraph(fn.f, fn.D, lo, hi, lo - 1, hi + 1);
      expect(parts.length).toBeGreaterThan(0);
      for (const part of parts)
        for (const [x, y] of part) {
          expect(inDomain(fn, x)).toBe(true);
          expect(y).toBeCloseTo(fn.f(x), 12);
          expect(y).toBeGreaterThanOrEqual(lo - 1 - 1e-9);
          expect(y).toBeLessThanOrEqual(hi + 1 + 1e-9);
        }
    }
    const hyp = makeFn('hyp');
    expect(sampleGraph(hyp.f, hyp.D, -4, 4, -5, 5).length).toBe(2);
    // steile Stellen werden fein abgetastet
    const parts = sampleGraph(hyp.f, hyp.D, -4, 4, -5, 5, 0.05);
    for (const part of parts) for (let i = 1; i < part.length; i++) expect(Math.hypot(part[i]![0] - part[i - 1]![0], part[i]![1] - part[i - 1]![1])).toBeLessThan(0.3);
  });
});

describe('Befunde Paket 5', () => {
  it('1/x: linker Ast nur negative, rechter Ast nur positive Funktionswerte', () => {
    const hyp = makeFn('hyp');
    for (const x of [-4, -1, -0.25]) expect(hyp.f(x)).toBeLessThan(0);
    for (const x of [0.25, 1, 4]) expect(hyp.f(x)).toBeGreaterThan(0);
  });
  it('Aufgabe 5 und 6: (f⁻¹)′(b) = 1 / f′(a)', () => {
    expect(invSlopeAt(makeFn('sq', 'pos'), 1.5)).toBeCloseTo(1 / 3, 12);
    expect(invSlopeAt(makeFn('cube'), 2)).toBeCloseTo(1 / 6, 12);
    expect(makeFn('cube').df(0)).toBe(0);
  });
});
