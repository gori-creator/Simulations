import { describe, expect, it } from 'vitest';
import { detectModel, errorOrder, eulerTable, exact, fieldGrid, fineCurve, parseTerm, solveIVP, system, type Fn3 } from '../src/simulations/mathematik/richtungsfeld/model';

const T = (s: string) => {
  const r = parseTerm(s);
  if (!r.ok) throw new Error(`parse ${s}: ${r.msg} @${r.pos}`);
  return r;
};
const f1 = (s: string): Fn3 => T(s).f;

describe('Richtungsfeld: Lehrbuchwerte', () => {
  const F = system(f1('0,5·y'), 1);
  it("y′ = 0,5·y, y(0) = 2 → y(2) = 2e ≈ 5,437", () => {
    expect(exact({ kind: 'exp', k: 0.5 }, 0, 2)(2)).toBeCloseTo(2 * Math.E, 12);
    const rk = solveIVP(F, 'rk4', 0, [2], 2, 0.1);
    expect(rk.s.at(-1)![0]).toBeCloseTo(5.43656, 5);
  });
  it('Euler mit h = 0,5: 2 · 1,25⁴ ≈ 4,883', () => {
    const eu = solveIVP(F, 'euler', 0, [2], 2, 0.5);
    expect(eu.x).toEqual([0, 0.5, 1, 1.5, 2]);
    expect(eu.s.at(-1)![0]).toBeCloseTo(2 * 1.25 ** 4, 12);
    expect(eu.s.at(-1)![0]).toBeCloseTo(4.8828125, 12);
  });
  it('Heun liegt näher als Euler, RK4 am nächsten', () => {
    const ex = 2 * Math.E;
    const err = (m: 'euler' | 'heun' | 'rk4') => Math.abs(solveIVP(F, m, 0, [2], 2, 0.5).s.at(-1)![0]! - ex);
    expect(err('heun')).toBeLessThan(err('euler'));
    expect(err('rk4')).toBeLessThan(err('heun'));
    expect(err('rk4')).toBeLessThan(1e-3);
  });
  it('Fehlerordnungen: Euler 1, Heun 2, RK4 4', () => {
    const ex = 2 * Math.E;
    expect(errorOrder(F, 'euler', 0, [2], 2, 0.1, ex)).toBeCloseTo(1, 0);
    expect(errorOrder(F, 'heun', 0, [2], 2, 0.1, ex)).toBeCloseTo(2, 0);
    expect(errorOrder(F, 'rk4', 0, [2], 2, 0.2, ex)).toBeCloseTo(4, 0);
  });
  it('Euler-Tabelle', () => {
    const t = eulerTable(f1('0,5y'), 0, 2, 0.5, 3);
    expect(t[0]).toEqual({ x: 0, y: 2, m: 1, next: 2.5 });
    expect(t[1]!.next).toBeCloseTo(3.125, 12);
  });
});

describe('Richtungsfeld: Modelle', () => {
  it('beschränktes Wachstum y′ = 0,3·(100 − y)', () => {
    const r = T('0,3(100 - y)');
    const m = detectModel(r.f, 1, r.uses);
    expect(m).toEqual({ kind: 'bounded', k: expect.closeTo(0.3, 12), S: expect.closeTo(100, 9) });
    const y = exact(m!, 0, 20);
    expect(y(0)).toBeCloseTo(20, 12);
    // Abkühlung: nach ln2/0,3 ist die Hälfte des Abstands weg
    expect(y(Math.log(2) / 0.3)).toBeCloseTo(60, 9);
    const num = solveIVP(system(r.f, 1), 'rk4', 0, [20], 5, 0.05).s.at(-1)![0]!;
    expect(num).toBeCloseTo(y(5), 6);
  });
  it('logistisch y′ = 0,02·y·(10 − y): Wendepunkt bei S/2, Grenze S', () => {
    const r = T('0,02y(10-y)');
    const m = detectModel(r.f, 1, r.uses)!;
    expect(m.kind).toBe('logistic');
    const y = exact(m, 0, 1);
    expect(y(1000)).toBeCloseTo(10, 9);
    const num = solveIVP(system(r.f, 1), 'rk4', 0, [1], 8, 0.02).s.at(-1)![0]!;
    expect(num).toBeCloseTo(y(8), 6);
  });
  it('exponentiell und Zerfall', () => {
    const r = T('-0,1·y');
    expect(detectModel(r.f, 1, r.uses)).toEqual({ kind: 'exp', k: expect.closeTo(-0.1, 12) });
  });
  it('y′ = 2x − 1 ist eine Stammfunktionsaufgabe', () => {
    const r = T('2x - 1');
    const m = detectModel(r.f, 1, r.uses)!;
    expect(m.kind).toBe('linear');
    expect(exact(m, 0, 3)(2)).toBeCloseTo(5, 12);
  });
  it('kein Schul-Modell: y′ = x − y, y′ = x·y', () => {
    for (const s of ['x - y', 'x·y', 'sin(y)']) {
      const r = T(s);
      expect(detectModel(r.f, 1, r.uses)).toBeNull();
    }
  });
  it('Schwingung y″ = −4y: Periode π, y(π) = y(0)', () => {
    const r = T('-4y');
    const m = detectModel(r.f, 2, r.uses)!;
    expect(m).toEqual({ kind: 'oscillation', omega: expect.closeTo(2, 12), delta: expect.closeTo(0, 12) });
    const y = exact(m, 0, 1, 0);
    expect(y(Math.PI)).toBeCloseTo(1, 12);
    const num = solveIVP(system(r.f, 2), 'rk4', 0, [1, 0], Math.PI, 0.01).s.at(-1)!;
    expect(num[0]).toBeCloseTo(1, 7);
    expect(num[1]).toBeCloseTo(0, 6);
  });
  it('gedämpfte Schwingung y″ = −4y − 0,5y′', () => {
    const r = T("-4y - 0,5y'");
    const m = detectModel(r.f, 2, r.uses)!;
    expect(m.kind).toBe('oscillation');
    if (m.kind !== 'oscillation') return;
    expect(m.delta).toBeCloseTo(0.25, 12);
    const y = exact(m, 0, 1, 0);
    const num = solveIVP(system(r.f, 2), 'rk4', 0, [1, 0], 6, 0.01).s.at(-1)![0]!;
    expect(num).toBeCloseTo(y(6), 7);
    // Kriechfall und Grenzfall
    for (const s of ["-4y - 5y'", "-4y - 4y'"]) {
      const rr = T(s);
      const mm = detectModel(rr.f, 2, rr.uses)!;
      const yy = exact(mm, 0, 1, 0.5);
      const nn = solveIVP(system(rr.f, 2), 'rk4', 0, [1, 0.5], 3, 0.005).s.at(-1)![0]!;
      expect(nn).toBeCloseTo(yy(3), 7);
    }
  });
});

describe('Richtungsfeld: Terme und Hilfen', () => {
  it('liest Schreibweisen', () => {
    expect(f1('2x')(3, 0, 0)).toBe(6);
    expect(f1('x·y')(2, 3, 0)).toBe(6);
    expect(f1('xy')(2, 3, 0)).toBe(6);
    expect(f1('0,5y(10 − y)')(0, 2, 0)).toBe(8);
    expect(f1('sin x')(Math.PI / 2, 0, 0)).toBeCloseTo(1, 12);
    expect(f1('e^(-t)')(0, 0, 0)).toBe(1);
    expect(f1("-y'")(0, 0, 3)).toBe(-3);
    expect(f1('-x/y')(1, 2, 0)).toBe(-0.5);
    expect(f1('2^3^2')(0, 0, 0)).toBe(512);
    expect(T('x').uses).toEqual({ x: true, y: false, v: false });
  });
  it('meldet Fehler', () => {
    for (const s of ['', '2 +', '(x', 'x)', 'q', 'sin']) expect(parseTerm(s).ok, s).toBe(false);
  });
  it('Feine Kurve läuft in beide Richtungen und stoppt bei Explosion', () => {
    const c = fineCurve(system(f1('y^2'), 1), 0, [1], -2, 2, 0.01, 100);
    expect(c.x[0]).toBeCloseTo(-2, 9);
    expect(c.x.at(-1)!).toBeLessThan(1);
  });
  it('Gitter', () => {
    const g = fieldGrid(0, 10, 0, 5, 10, 5);
    expect(g.length).toBe(50);
    expect(g[0]).toEqual([0.5, 0.5]);
  });
  it('Kreise: y′ = −x/y, Lösung bleibt auf dem Kreis', () => {
    const c = solveIVP(system(f1('-x/y'), 1), 'rk4', 0, [2], 1.5, 0.01).s.at(-1)![0]!;
    expect(1.5 ** 2 + c ** 2).toBeCloseTo(4, 7);
  });
});

describe('Richtungsfeld: Rechenweg', () => {
  it('Kennwerte der Modelle', async () => {
    const { derivation } = await import('../src/simulations/mathematik/richtungsfeld/model');
    const n = (v: number) => String(Math.round(v * 1000) / 1000);
    const e = derivation({ kind: 'exp', k: 0.5 }, 0, 2, 0, n);
    expect(e.facts[0]!.value).toBe(n(Math.log(2) / 0.5));
    expect(e.lines.at(-1)).toContain('C = 2');
    const lg = derivation({ kind: 'logistic', k: 0.05, S: 10 }, 0, 0.5, 0, n);
    // Wendestelle: y = 5 bei x = ln(19)/0,5
    expect(lg.facts[1]!.value).toBe(`x = ${n(Math.log(19) / 0.5)}`);
    expect(exact({ kind: 'logistic', k: 0.05, S: 10 }, 0, 0.5)(Math.log(19) / 0.5)).toBeCloseTo(5, 10);
    const o = derivation({ kind: 'oscillation', omega: 2, delta: 0 }, 0, 2, 0, n);
    expect(o.facts[0]!.value).toBe(n(Math.PI));
    const b = derivation({ kind: 'bounded', k: 0.1, S: 20 }, 0, 90, 0, n, 'en');
    expect(b.facts[1]!.value).toBe(n(Math.log(2) / 0.1));
  });
});

import { fallSpeed, herdImmunity, lvEquilibrium, lvInvariant, quizRound, QUIZ_EQS, solveSys, sysRhs, terminalSpeed, parseTerm as pt } from '../src/simulations/mathematik/richtungsfeld/model';

const SP = { a: 1, c: 0.8, b: 0.1, d: 0.02, R0: 3, gamma: 0.1, N: 1000, g: 9.81, k: 0.004 };

describe('Richtungsfeld: Systeme', () => {
  it('Räuber-Beute: Gleichgewicht (40 | 10), Erhaltungsgröße bleibt (RK4) erhalten', () => {
    expect(lvEquilibrium(SP)).toEqual([40, 10]);
    const F = sysRhs('lv', SP);
    expect(F(0, [40, 10])).toEqual([0, 0]);
    const r = solveSys(F, [60, 5], 40, 0.01);
    const V0 = lvInvariant(SP, 60, 5);
    for (const s of r.s.filter((_, i) => i % 500 === 0)) expect(lvInvariant(SP, s[0]!, s[1]!)).toBeCloseTo(V0, 4);
  });
  it('SIR: Summe bleibt N, Maximum der Infizierten bei S = N/R₀; Herdenimmunität 1 − 1/R₀', () => {
    const r = solveSys(sysRhs('sir', SP), [999, 1, 0], 200, 0.05);
    for (const s of r.s.filter((_, i) => i % 400 === 0)) expect(s[0]! + s[1]! + s[2]!).toBeCloseTo(1000, 6);
    let iMax = 0;
    let sAt = 0;
    for (const s of r.s) if (s[1]! > iMax) {
      iMax = s[1]!;
      sAt = s[0]!;
    }
    expect(sAt).toBeCloseTo(1000 / 3, -1);
    expect(herdImmunity(3)).toBeCloseTo(2 / 3, 12);
    expect(herdImmunity(0.8)).toBe(0);
  });
  it('Fall mit Luftwiderstand: v_E = √(g/k) ≈ 49,5 m/s, numerisch wie tanh-Lösung', () => {
    expect(terminalSpeed(9.81, 0.004)).toBeCloseTo(49.52, 2);
    const r = solveSys(sysRhs('fall', SP), [0, 0], 10, 0.01);
    expect(r.s.at(-1)![1]!).toBeCloseTo(fallSpeed(9.81, 0.004, 10), 6);
  });
});

describe('Richtungsfeld: Rätsel', () => {
  it('vier verschiedene, lesbare Gleichungen; gleiche Nummer gleiche Runde', () => {
    for (const e of QUIZ_EQS) expect(pt(e).ok).toBe(true);
    const q = quizRound(5);
    expect(new Set(q.eqs).size).toBe(4);
    expect(q.target).toBeGreaterThanOrEqual(0);
    expect(q.target).toBeLessThan(4);
    expect(quizRound(5)).toEqual(q);
  });
});
