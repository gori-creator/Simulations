import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  basinMap,
  classify,
  correctDigits,
  errors,
  FN_KEYS,
  FNS,
  heronStep,
  isCycle,
  iterate,
  matchingDecimals,
  nearestRootIndex,
  newtonStep,
  quadConstant,
  sequence,
  tangent,
} from '../src/simulations/mathematik/newton-verfahren/model';

describe('Modell: Newton-Verfahren', () => {
  it('√2 mit x₀ = 1: x₁ = 1,5; x₂ = 17/12 ≈ 1,416667; x₃ = 577/408 ≈ 1,4142157', () => {
    const xs = sequence(FNS.sq2, 1, 3);
    expect(xs[1]).toBe(1.5);
    expect(xs[2]).toBeCloseTo(17 / 12, 14);
    expect(xs[2]).toBeCloseTo(1.416667, 6);
    expect(xs[3]).toBeCloseTo(577 / 408, 14);
    expect(xs[3]).toBeCloseTo(1.4142157, 7);
  });

  it('x² − 2: Newton ist genau das Heron-Verfahren (x + 2/x) : 2', () => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const x = 0.05 + rnd() * 6;
      const s = newtonStep(FNS.sq2, x);
      expect(s.next).toBeCloseTo(heronStep(2, x), 12);
    }
    // Heron ab 1 von Hand: 1 → 3/2 → 17/12 → 577/408
    expect(heronStep(2, 1)).toBe(1.5);
    expect(heronStep(2, 1.5)).toBeCloseTo(17 / 12, 15);
  });

  it('Newtons Beispiel x³ − 2x − 5 mit x₀ = 2: f(2) = −1, f′(2) = 10, x₁ = 2,1; f(2,1) = 0,061, f′(2,1) = 11,23, x₂ ≈ 2,094568', () => {
    const s0 = newtonStep(FNS.cubic, 2);
    expect(s0.fx).toBe(-1);
    expect(s0.dfx).toBe(10);
    expect(s0.next).toBeCloseTo(2.1, 14);
    const s1 = newtonStep(FNS.cubic, 2.1);
    expect(s1.fx).toBeCloseTo(0.061, 12);
    expect(s1.dfx).toBeCloseTo(11.23, 12);
    expect(s1.next).toBeCloseTo(2.1 - 0.061 / 11.23, 12);
    expect(s1.next).toBeCloseTo(2.094568, 6);
    expect(FNS.cubic.roots[0]).toBeCloseTo(2.0945515, 7);
    const o = classify(FNS.cubic, 2);
    expect(o.kind).toBe('root');
  });

  it('cos x − x mit x₀ = 1: x₁ ≈ 0,750364, x₂ ≈ 0,739113; Nullstelle ≈ 0,739085', () => {
    const xs = sequence(FNS.cos, 1, 4);
    expect(xs[1]).toBeCloseTo(0.750364, 6);
    expect(xs[1]).toBeCloseTo(0.7503638678, 9);
    expect(xs[2]).toBeCloseTo(0.7391128909, 9);
    expect(xs[4]).toBeCloseTo(0.739085, 6);
    expect(FNS.cos.roots[0]).toBeCloseTo(0.739085, 6);
  });

  it('Zyklus: x³ − 2x + 2 mit x₀ = 0 springt 0 → 1 → 0 → 1 …', () => {
    const xs = sequence(FNS.cycle, 0, 4);
    expect(xs).toEqual([0, 1, 0, 1, 0]);
    expect(isCycle(xs)).toBe(true);
    expect(isCycle(xs.slice(0, 3))).toBe(true);
    const o = classify(FNS.cycle, 0);
    expect(o.kind).toBe('cycle');
    if (o.kind === 'cycle') {
      expect(o.period).toBe(2);
      expect(o.values).toEqual([0, 1]);
    }
    // Der Zyklus zieht auch Nachbarn an (x₀ = 0,1), ein Start links der Nullstelle konvergiert
    expect(classify(FNS.cycle, 0.1).kind).toBe('cycle');
    const left = classify(FNS.cycle, -2);
    expect(left.kind).toBe('root');
    expect(sequence(FNS.cycle, -2, 1)[1]).toBeCloseTo(-1.8, 14);
  });

  it('x³ − 3x + 1: Nullstellen ≈ −1,879385; 0,347296; 1,532089 und waagrechte Tangente bei x₀ = 1', () => {
    const fn = FNS.three;
    expect(fn.roots[0]).toBeCloseTo(-1.879385, 6);
    expect(fn.roots[1]).toBeCloseTo(0.347296, 6);
    expect(fn.roots[2]).toBeCloseTo(1.532089, 6);
    const s = newtonStep(fn, 1);
    expect(s.dfx).toBe(0);
    expect(s.fx).toBe(-1);
    expect(s.next).toBeNull();
    expect(s.status).toBe('flat');
    expect(iterate(fn, 1, 5).length).toBe(1);
    expect(classify(fn, 1)).toEqual({ kind: 'flat', at: 1, steps: 0 });
    // auch x² − 2 bei x₀ = 0
    expect(newtonStep(FNS.sq2, 0).status).toBe('flat');
  });

  it('Sprung: x³ − 3x + 1 ab x₀ = 0,95 (nahe dem Tiefpunkt) landet bei der linken Nullstelle', () => {
    const fn = FNS.three;
    const xs = sequence(fn, 0.95, 6);
    expect(xs[1]).toBeLessThan(-2.4);
    expect(xs[1]).toBeCloseTo(0.95 - (0.95 ** 3 - 2.85 + 1) / (3 * 0.95 ** 2 - 3), 12);
    const o = classify(fn, 0.95);
    expect(o.kind === 'root' && o.index).toBe(0);
    // obwohl die rechte Nullstelle 1,532… am nächsten liegt
    expect(nearestRootIndex(fn, 0.95)).toBe(2);
    // x₀ = 0,9 springt über −0,80 nach rechts zu 1,532…
    const o2 = classify(fn, 0.9);
    expect(o2.kind === 'root' && o2.index).toBe(2);
    // x₀ = 0,5 läuft brav zur nächsten Nullstelle
    expect(sequence(fn, 0.5, 1)[1]).toBeCloseTo(1 / 3, 14);
    const o3 = classify(fn, 0.5);
    expect(o3.kind === 'root' && o3.index).toBe(1);
  });

  it('quadratische Konvergenz: für x² − 2 ab x₀ = 1 ist e_{n+1} ≈ e_n² / (2√2)', () => {
    const xs = sequence(FNS.sq2, 1, 4);
    const e = errors(xs, Math.SQRT2);
    const C = 1 / (2 * Math.SQRT2);
    expect(quadConstant(FNS.sq2, Math.SQRT2)).toBeCloseTo(C, 14);
    // je näher an der Nullstelle, desto genauer stimmt e_{n+1} / e_n² mit C überein
    expect(e[2]! / e[1]! ** 2).toBeCloseTo(C, 1);
    expect(e[3]! / e[2]! ** 2).toBeCloseTo(C, 2);
    expect(Math.abs(e[4]! / e[3]! ** 2 - C) / C).toBeLessThan(0.01);
    // exakt gilt für Heron: e_{n+1} = e_n² / (2 x_n)
    for (let n = 1; n < 3; n++) expect(e[n + 1]!).toBeCloseTo(e[n]! ** 2 / (2 * xs[n]!), 14);
  });

  it('richtige Stellen: 1,5 → 0; 17/12 → 2; 577/408 → 5; x₄ → 11 (verdoppeln sich ungefähr)', () => {
    const xs = sequence(FNS.sq2, 1, 4);
    const d = xs.map((x) => matchingDecimals(x, Math.SQRT2));
    expect(d).toEqual([0, 0, 2, 5, 11]);
    // alte Kennzahl über den Fehler bleibt verträglich
    const d2 = xs.map((x) => correctDigits(FNS.sq2, x));
    expect(d2[2]).toBeGreaterThanOrEqual(2);
    expect(d2[3]).toBeGreaterThanOrEqual(5);
    expect(d2[4]).toBeGreaterThanOrEqual(11);
    // negative Zahlen und ganzzahliger Teil
    expect(matchingDecimals(-1.8793, -1.8793852)).toBe(4);
    expect(matchingDecimals(2.5, 1.4)).toBe(-1);
  });

  it('doppelte Nullstelle: x³ − 3x + 2 ab x₀ = 2, Fehler halbiert sich nur (lineare Konvergenz)', () => {
    const fn = FNS.dbl;
    expect(fn.f(1)).toBe(0);
    expect(fn.df(1)).toBe(0);
    expect(fn.f(-2)).toBe(0);
    for (const x of [-2.5, 0, 0.3, 2, 3.7]) expect(fn.f(x)).toBeCloseTo(x ** 3 - 3 * x + 2, 12);
    const xs = sequence(fn, 2, 12);
    expect(xs[1]).toBeCloseTo(14 / 9, 14);
    const e = errors(xs, 1);
    expect(e[12]! / e[11]!).toBeCloseTo(0.5, 2);
    expect(Number.isNaN(quadConstant(fn, 1))).toBe(true);
    const o = classify(fn, 2);
    expect(o.kind === 'root' && o.index).toBe(1);
  });

  it('Tangente: geht durch (x | f(x)) und schneidet die x-Achse bei x − f(x)/f′(x)', () => {
    const t = tangent(FNS.sq2, 1.5);
    expect(t.m).toBe(3);
    expect(t.m * 1.5 + t.b).toBeCloseTo(0.25, 14);
    expect(-t.b / t.m).toBeCloseTo(17 / 12, 14);
  });

  it('Einzugsbereiche: x² − 2 – positive Startwerte → √2, negative → −√2, 0 → keine', () => {
    const map = basinMap(FNS.sq2, [-2, -0.3, 0, 0.3, 3]);
    expect(map).toEqual([0, 0, -1, 1, 1]);
    // x³ − 3x + 1: zwischen den Extremstellen liegt bei 0 die mittlere Nullstelle
    expect(basinMap(FNS.three, [0])).toEqual([1]);
  });

  it('Plausibilität: Nullstellen stimmen, Verfahren konvergiert von nahen Startwerten', () => {
    const rnd = seededRandom(2024);
    for (const key of FN_KEYS) {
      const fn = FNS[key];
      fn.roots.forEach((r, j) => {
        expect(Math.abs(fn.f(r))).toBeLessThan(1e-12);
        for (let i = 0; i < 25; i++) {
          const x0 = r + (rnd() - 0.5) * 0.2;
          const o = classify(fn, x0);
          expect(o.kind).toBe('root');
          if (o.kind === 'root') expect(o.index).toBe(j);
          const xs = sequence(fn, x0, fn.mult[j]! > 1 ? 40 : 8);
          expect(xs[xs.length - 1]).toBeCloseTo(r, fn.mult[j]! > 1 ? 6 : 9);
        }
      });
    }
  });

  it('Plausibilität: Jeder Schritt liegt auf der Tangente; Ableitungen stimmen numerisch', () => {
    const rnd = seededRandom(99);
    for (const key of FN_KEYS) {
      const fn = FNS[key];
      for (let i = 0; i < 60; i++) {
        const x = -3 + rnd() * 7;
        const h = 1e-5;
        expect(fn.df(x)).toBeCloseTo((fn.f(x + h) - fn.f(x - h)) / (2 * h), 4);
        expect(fn.d2f(x)).toBeCloseTo((fn.df(x + h) - fn.df(x - h)) / (2 * h), 4);
        const s = newtonStep(fn, x);
        if (s.next === null) continue;
        // Tangente durch (x | f(x)) mit Steigung f′(x) hat bei next den Wert 0
        expect(s.fx + s.dfx * (s.next - x)).toBeCloseTo(0, 6);
        // Steigungsdreieck: f′(x) = f(x) : (x − next)
        if (Math.abs(x - s.next) > 1e-9) expect(s.fx / (x - s.next)).toBeCloseTo(s.dfx, 6);
      }
    }
  });
});
