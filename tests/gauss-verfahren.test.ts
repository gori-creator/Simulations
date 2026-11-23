import { describe, expect, it } from 'vitest';
import {
  applyOp,
  backSubstitution,
  frac,
  fracText,
  gauss,
  isEchelon,
  lineInBox,
  opText,
  parseSystem,
  planeBoxPolygon,
  randomSystem,
  ranks,
  satisfies,
  solve,
  systemText,
  fval,
  type Matrix,
} from '../src/simulations/mathematik/gauss-verfahren/model';

const M = (src: string): Matrix => {
  const r = parseSystem(src);
  if (!r.ok) throw new Error('parse ' + src);
  return r.sys.m;
};
const vals = (xs: { n: number; d: number }[]) => xs.map((v) => v.n / v.d);

describe('Gauß-Verfahren: Lehrbuchwerte', () => {
  const BOOK = 'x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27';

  it('liest das System als erweiterte Matrix', () => {
    const r = parseSystem(BOOK);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sys.vars).toEqual(['x', 'y', 'z']);
    expect(r.sys.m.map(vals)).toEqual([
      [1, 1, 1, 6],
      [0, 2, 5, -4],
      [2, 5, -1, 27],
    ]);
  });

  it('x + y + z = 6, 2y + 5z = −4, 2x + 5y − z = 27 → (5 | 3 | −2)', () => {
    const s = solve(M(BOOK));
    expect(s.kind).toBe('unique');
    if (s.kind === 'unique') expect(vals(s.x)).toEqual([5, 3, -2]);
  });

  it('Stufenform nach den Vorwärtsschritten, Rückwärtseinsetzen liefert dieselbe Lösung', () => {
    const steps = gauss(M(BOOK));
    const e = steps[steps.length - 1]!.m;
    expect(isEchelon(e)).toBe(true);
    const back = backSubstitution(e)!;
    expect(back.map((b) => b.col)).toEqual([2, 1, 0]);
    expect(vals(back.map((b) => b.value))).toEqual([-2, 3, 5]);
  });

  it('erster Schritt ist III − 2 · I', () => {
    const st = gauss(M(BOOK));
    expect(opText(st[0]!.op)).toBe('III − 2 · I');
  });

  it('ganzzahlig: nur ganze Zahlen in allen Zwischenschritten', () => {
    const st = gauss(M('2x + 3y - z = 5; 3x - 2y + 2z = 3; 5x + y - 3z = -2'), { integer: true });
    for (const s of st) for (const r of s.m) for (const v of r) expect(v.d).toBe(1);
    expect(isEchelon(st[st.length - 1]!.m)).toBe(true);
  });

  it('mit Brüchen und ganzzahlig: gleiche Lösung', () => {
    const m = M('2x + 3y - z = 5; 3x - 2y + 2z = 3; 5x + y - 3z = -2');
    const s = solve(m);
    expect(s.kind).toBe('unique');
    if (s.kind === 'unique') expect(satisfies(m, s.x)).toBe(true);
  });

  it('Widerspruch 0 = 1 → keine Lösung', () => {
    const m = M('x + y + z = 1; x + y + z = 2; x - y = 0');
    const s = solve(m);
    expect(s.kind).toBe('none');
    const { rank, rankAug } = ranks(m);
    expect(rank).toBe(2);
    expect(rankAug).toBe(3);
  });

  it('Nullzeile → unendlich viele Lösungen mit einem Parameter', () => {
    const m = M('x + y + z = 6; x - y + 2z = 3; 2x + 3z = 9');
    const s = solve(m);
    expect(s.kind).toBe('infinite');
    if (s.kind !== 'infinite') return;
    expect(s.free).toEqual([2]);
    for (const t of [-2, 0, 1, 3.5]) {
      const x = s.p.map((v, c) => frac(Math.round((fval(v) + t * fval(s.dirs[0]![c]!)) * 1e6), 1e6));
      expect(satisfies(m, x)).toBe(true);
    }
  });

  it('zwei Gleichungen, drei Unbekannte (unterbestimmt)', () => {
    const s = solve(M('x + 2y - z = 1; 2x + y + z = 5'));
    expect(s.kind).toBe('infinite');
  });

  it('überbestimmt: drei Gleichungen, zwei Unbekannte', () => {
    const s = solve(M('x + y = 3; x - y = 1; 2x + y = 5'));
    expect(s.kind).toBe('unique');
    if (s.kind === 'unique') expect(vals(s.x)).toEqual([2, 1]);
    expect(solve(M('x + y = 3; x - y = 1; 2x + y = 6')).kind).toBe('none');
  });

  it('vier Unbekannte x₁ … x₄', () => {
    const r = parseSystem('x1 + x2 + x3 + x4 = 10; x1 - x2 = -1; x3 - x4 = -1; 2x1 + x3 = 5');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sys.vars).toEqual(['x₁', 'x₂', 'x₃', 'x₄']);
    const s = solve(r.sys.m);
    expect(s.kind).toBe('unique');
    if (s.kind === 'unique') expect(vals(s.x)).toEqual([1, 2, 3, 4]);
  });
});

describe('Gauß-Verfahren: Lesen und Brüche', () => {
  it('Brüche, Dezimalkomma, Terme auf beiden Seiten', () => {
    const m = M('1/2x + 0,5y = 2 + y; x = 3 - y/3');
    expect(m.map(vals)).toEqual([
      [0.5, -0.5, 2],
      [1, 1 / 3, 3],
    ]);
  });
  it('Fehler werden gemeldet', () => {
    expect(parseSystem('').ok).toBe(false);
    expect(parseSystem('x + y').ok).toBe(false);
    const nl = parseSystem('x^2 + y = 1');
    expect(nl.ok === false && nl.msg).toBe('nonlinear');
    const xy = parseSystem('x*y = 1');
    expect(xy.ok === false && xy.msg).toBe('nonlinear');
  });
  it('Bruchrechnung und Text', () => {
    expect(fracText(frac(-6, 4))).toBe('−3/2');
    expect(fracText(frac(4, 2))).toBe('2');
  });
  it('Umformungen ändern die Lösungsmenge nicht', () => {
    const m = M('x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27');
    const ops = [
      { kind: 'swap', i: 0, j: 2 },
      { kind: 'scale', i: 1, a: frac(-3) },
      { kind: 'comb', i: 2, a: frac(2), j: 0, b: frac(-1, 2) },
    ] as const;
    let k = m;
    for (const op of ops) k = applyOp(k, op);
    const s = solve(k);
    expect(s.kind === 'unique' && vals(s.x)).toEqual([5, 3, -2]);
    expect(opText(ops[2])).toBe('2 · III − 1/2 · I');
  });
  it('Text zurück und wieder lesen', () => {
    const r = parseSystem('x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27');
    if (!r.ok) throw new Error();
    const again = M(systemText(r.sys.vars, r.sys.m));
    expect(again.map(vals)).toEqual(r.sys.m.map(vals));
  });
});

describe('Gauß-Verfahren: Geometrie und Zufall', () => {
  it('Ebene z = 0 im Würfel ist ein Viereck', () => {
    const poly = planeBoxPolygon([0, 0, 1], 0, -2, 2);
    expect(poly.length).toBe(4);
    for (const q of poly) expect(q[2]).toBeCloseTo(0, 12);
  });
  it('schräge Ebene x + y + z = 0 schneidet den Würfel als Sechseck', () => {
    expect(planeBoxPolygon([1, 1, 1], 0, -1, 1).length).toBe(6);
    expect(planeBoxPolygon([1, 1, 1], 10, -1, 1).length).toBe(0);
  });
  it('Gerade im Quadrat', () => {
    const l = lineInBox(1, 1, 0, -2, 2)!;
    expect(l[0][0] + l[0][1]).toBeCloseTo(0, 12);
    expect(lineInBox(1, 0, 5, -2, 2)).toBeNull();
  });
  it('Zufallsaufgaben haben die gewünschte Art', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let k = 0; k < 20; k++) {
      expect(solve(randomSystem(3, rnd)).kind).toBe('unique');
      expect(solve(randomSystem(3, rnd, 'none')).kind).toBe('none');
      expect(solve(randomSystem(3, rnd, 'infinite')).kind).toBe('infinite');
    }
  });
  it('Zufallssystem: ganzzahlige Lösung', () => {
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const s = solve(randomSystem(3, rnd));
    if (s.kind === 'unique') for (const v of s.x) expect(v.d).toBe(1);
  });
});

describe('Gauß-Verfahren: eigene Umformungen', () => {
  it('liest übliche Schreibweisen', async () => {
    const { parseOp } = await import('../src/simulations/mathematik/gauss-verfahren/model');
    const t = (s: string) => {
      const r = parseOp(s, 3);
      return r.ok ? opText(r.op) : r.msg;
    };
    expect(t('III - 2·I')).toBe('III − 2 · I');
    expect(t('2*III + 3*I')).toBe('2 · III + 3 · I');
    expect(t('I <-> III')).toBe('I ↔ III');
    expect(t('II : 2')).toBe('II : 2');
    expect(t('1/2 II')).toBe('II : 2');
    expect(t('3/2 II')).toBe('3/2 · II');
    expect(t('-II')).toBe('−II');
    expect(t('Z3 − 2 Z1')).toBe('III − 2 · I');
    expect(t('IV - I')).toBe('row');
    expect(t('II - II')).toBe('target');
    expect(t('0 II')).toBe('zero');
    expect(t('II -')).toBe('token');
  });
  it('Umformungsliste führt zur Lösung', async () => {
    const { applyOps } = await import('../src/simulations/mathematik/gauss-verfahren/model');
    const m = M('x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27');
    const r = applyOps(m, 'III - 2I; 2 III - 3 II');
    expect(r.error).toBeUndefined();
    expect(isEchelon(r.m)).toBe(true);
    expect(r.m[2]!.map((v) => v.n / v.d)).toEqual([0, 0, -21, 42]);
    expect(applyOps(m, 'III - 2I; quatsch').error).toBe(1);
  });
});
