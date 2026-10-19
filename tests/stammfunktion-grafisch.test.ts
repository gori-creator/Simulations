import { describe, expect, it } from 'vitest';
import {
  anti,
  APPS,
  constantFor,
  DEFAULT_COEFFS,
  deriv,
  erf,
  F,
  features,
  FNS,
  integrate,
  mathFn,
  pieces,
  piecewiseLinear,
  rateSketch,
  signTable,
  spline,
  type FnKey,
} from '../src/simulations/mathematik/stammfunktion-grafisch/model';

describe('Modell: Vom Graphen zur Stammfunktion', () => {
  it('f(x) = x² − 1: F(x) = x³/3 − x + C, F(3) − F(0) = 6', () => {
    expect(F(FNS.par, 0, 3)).toBe(6);
    expect(F(FNS.par, 2, 3)).toBe(8);
    expect(integrate(FNS.par.f, 0, 3)).toBeCloseTo(6, 10);
  });
  it('cos → sin; Nullstelle von f bei π/2 ist Hochpunkt von F', () => {
    expect(FNS.cos.F0(Math.PI / 2)).toBe(1);
    const h = 1e-3;
    expect(FNS.cos.F0(Math.PI / 2 - h)).toBeLessThan(1);
    expect(FNS.cos.F0(Math.PI / 2 + h)).toBeLessThan(1);
  });
  it('Plausibilität: F′ = f und F(b) − F(a) = ∫ f', () => {
    for (const fn of Object.values(FNS)) {
      for (let i = 0; i < 20; i++) {
        const a = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        const b = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        expect(F(fn, 1.5, b) - F(fn, 1.5, a)).toBeCloseTo(integrate(fn.f, a, b), 7);
        expect((fn.F0(a + 1e-6) - fn.F0(a - 1e-6)) / 2e-6).toBeCloseTo(fn.f(a), 5);
      }
    }
  });
  it('Gauß (Fassung 1): F = 1 − e^(−x²/2) + C', () => {
    expect(FNS.gauss.F0(0)).toBe(0);
    expect(F(FNS.gauss, 2, 1)).toBeCloseTo(3 - Math.exp(-0.5), 12);
  });
});

describe('Anfangswertproblem: F(x₀) = y₀ legt C fest', () => {
  it('f(x) = 3x² − 2 mit F(1) = 4 ⇒ F(x) = x³ − 2x + 5', () => {
    const fn = mathFn('cub', { ...DEFAULT_COEFFS, k3: 0, k2: 3, k1: 0, k0: -2 });
    const C = constantFor(fn, 1, 4);
    expect(C).toBeCloseTo(5, 12);
    expect(anti(fn, C, 2)).toBeCloseTo(8 - 4 + 5, 12);
    expect(anti(fn, C, 0)).toBeCloseTo(5, 12);
    // auch als Parabel eingegeben
    const par = mathFn('par', { ...DEFAULT_COEFFS, pa: 3, pb: 0, pc: -2 });
    expect(constantFor(par, 1, 4)).toBeCloseTo(5, 12);
  });
  it('f = cos mit F(0) = 1 ⇒ F(x) = sin x + 1, F(π/2) = 2', () => {
    const fn = mathFn('cos');
    const C = constantFor(fn, 0, 1);
    expect(C).toBeCloseTo(1, 12);
    expect(anti(fn, C, Math.PI / 2)).toBeCloseTo(2, 12);
  });
  it('f = eˣ durch (0 | 3) ⇒ F(x) = eˣ + 2', () => {
    const fn = mathFn('exp');
    const C = constantFor(fn, 0, 3);
    expect(C).toBeCloseTo(2, 12);
    expect(anti(fn, C, 1)).toBeCloseTo(Math.E + 2, 12);
  });
  it('f = sin mit Amplitude und Frequenz: F₀ = −A/b · cos(bx)', () => {
    const fn = mathFn('sin', { ...DEFAULT_COEFFS, sa: 2, sb: 0.5 });
    expect(fn.F(0)).toBeCloseTo(-4, 12);
    expect(fn.F(Math.PI) - fn.F(0)).toBeCloseTo(4, 12);
  });
  it('Gauß x · e^(−x²/(2σ²)): F₀ = −σ² · e^(−x²/(2σ²))', () => {
    const fn = mathFn('gauss', { ...DEFAULT_COEFFS, gs: 1.5 });
    expect(fn.F(0)).toBeCloseTo(-2.25, 12);
    expect(deriv(fn.F, 0.7)).toBeCloseTo(fn.f(0.7), 7);
  });
  it('Glockenkurve: Gesamtfläche gegen √(2π)', () => {
    const fn = mathFn('bell');
    expect(fn.F(4) - fn.F(-4)).toBeCloseTo(Math.sqrt(2 * Math.PI) * erf(2 * Math.SQRT2), 10);
    expect(fn.F(8) - fn.F(-8)).toBeCloseTo(Math.sqrt(2 * Math.PI), 8);
  });
  it('alle Funktionen: F₀′ = f und F₀(b) − F₀(a) = ∫ f (Plausibilität)', () => {
    const keys: FnKey[] = ['lin', 'par', 'cub', 'sin', 'cos', 'exp', 'gauss', 'bell', 'step', 'own'];
    for (const key of keys) {
      const fn = mathFn(key);
      for (let i = 0; i < 15; i++) {
        const a = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        const b = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        const n = key === 'step' ? 20000 : 400;
        expect(fn.F(b) - fn.F(a)).toBeCloseTo(integrate(fn.f, a, b, n), key === 'step' ? 2 : 6);
        if (!fn.jumps?.some((j) => Math.abs(j - a) < 1e-3)) expect(deriv(fn.F, a, 1e-6)).toBeCloseTo(fn.f(a), 4);
      }
      expect(fn.nodes).toHaveLength(7);
    }
  });
});

describe('Merkmale: von f auf F schließen', () => {
  it('f = 2x − 4: F hat bei x = 2 einen Tiefpunkt', () => {
    const fn = mathFn('lin', { ...DEFAULT_COEFFS, lm: 2, lt: -4 });
    const fe = features(fn);
    expect(fe.zeros).toHaveLength(1);
    expect(fe.zeros[0]!.x).toBeCloseTo(2, 9);
    expect(fe.zeros[0]!.sign).toBe(1);
    expect(fe.ext).toHaveLength(0);
  });
  it('f = x² − 1: Hochpunkt von F bei −1, Tiefpunkt bei 1, Wendepunkt bei 0', () => {
    const fe = features(mathFn('par'));
    expect(fe.zeros.map((z) => z.x)).toEqual([expect.closeTo(-1, 8), expect.closeTo(1, 8)]);
    expect(fe.zeros.map((z) => z.sign)).toEqual([-1, 1]);
    expect(fe.ext).toHaveLength(1);
    expect(fe.ext[0]!.x).toBeCloseTo(0, 6);
    expect(fe.ext[0]!.kind).toBe('min');
  });
  it('f = x²: Nullstelle ohne Vorzeichenwechsel ⇒ Terrassenpunkt', () => {
    const fe = features(mathFn('par', { ...DEFAULT_COEFFS, pa: 1, pb: 0, pc: 0 }));
    expect(fe.zeros).toHaveLength(1);
    expect(fe.zeros[0]!.sign).toBe(0);
    expect(fe.zeros[0]!.x).toBeCloseTo(0, 4);
  });
  it('Treppe: Vorzeichenwechsel an Sprungstellen sind Extremstellen von F', () => {
    const fn = mathFn('step');
    const fe = features(fn);
    expect(fe.zeros.map((z) => [z.x, z.sign, z.jump])).toEqual([
      [-1, -1, true],
      [1.5, 1, true],
    ]);
    // F₀(x) = ∫₀ˣ f: F₀(2) = −1,5 + 0,25, F₀(−2) = −(1 − 1) = 0
    expect(fn.F(2)).toBeCloseTo(-1.25, 12);
    expect(fn.F(-2)).toBeCloseTo(0, 12);
  });
  it('Vorzeichentabelle für x² − 1', () => {
    const t = signTable(mathFn('par'));
    expect(t.map((s) => [s.f, s.d])).toEqual([
      [1, -1],
      [-1, -1],
      [-1, 1],
      [1, 1],
    ]);
  });
  it('Flächenstücke von sin zwischen den Nullstellen: jeweils 2', () => {
    const ps = pieces(mathFn('sin'), -2 * Math.PI, 2 * Math.PI);
    expect(ps).toHaveLength(4);
    expect(ps.map((q) => q.area)).toEqual([expect.closeTo(2, 8), expect.closeTo(-2, 8), expect.closeTo(2, 8), expect.closeTo(-2, 8)]);
  });
});

describe('Bausteine', () => {
  it('abschnittsweise linear: Trapez des Aufzugs', () => {
    const pw = piecewiseLinear(
      [
        [0, 0],
        [2, 2],
        [8, 2],
        [10, 0],
      ],
      0,
    );
    expect(pw.F(10)).toBeCloseTo(16, 12);
    expect(pw.F(1)).toBeCloseTo(0.5, 12);
    expect(pw.kinks).toEqual([2, 8]);
  });
  it('Spline gibt lineare Daten exakt wieder, Integral exakt', () => {
    const sp = spline([-3, -2, -1, 0, 1, 2, 3], [-3, -2, -1, 0, 1, 2, 3], 0);
    expect(sp.f(0.37)).toBeCloseTo(0.37, 12);
    expect(sp.F(3)).toBeCloseTo(4.5, 12);
    expect(sp.d(-1.4)).toBeCloseTo(1, 12);
    const own = mathFn('own', { ...DEFAULT_COEFFS, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1 });
    expect(own.F(2)).toBeCloseTo(2, 12);
  });
  it('Skizze: richtige Stützpunkte werden als sehr gut bewertet', () => {
    const fn = mathFn('lin', { ...DEFAULT_COEFFS, lm: 0, lt: 1 });
    const ys = fn.nodes.map((x) => fn.F(x) + 2);
    const r = rateSketch(fn, 2, fn.nodes, ys);
    expect(r.mean).toBeCloseTo(0, 12);
    expect(r.grade).toBe(3);
    expect(r.checks.every((c) => c.ok)).toBe(true);
    const par = mathFn('par');
    const r2 = rateSketch(par, 0, par.nodes, par.nodes.map((x) => par.F(x)));
    expect(r2.grade).toBe(3);
    expect(r2.checks.every((c) => c.ok)).toBe(true);
    // flache Linie bei y = 0 ist für x³/3 − x falsch
    const r3 = rateSketch(par, 0, par.nodes, par.nodes.map(() => 0));
    expect(r3.grade).toBeLessThan(2);
    expect(r3.checks.some((c) => !c.ok)).toBe(true);
  });
});

describe('Anwendungen', () => {
  it('Regenbecken: Tiefpunkt bei 1 h, Hochpunkt bei 7 h, Wendepunkt bei 4 h', () => {
    const ap = APPS.pool;
    const C = constantFor(ap, 0, 20);
    expect(anti(ap, C, 1)).toBeCloseTo(55 / 3, 10);
    expect(anti(ap, C, 7)).toBeCloseTo(109 / 3, 10);
    const fe = features(ap);
    expect(fe.zeros.map((z) => [Number(z.x.toFixed(6)), z.sign])).toEqual([
      [1, 1],
      [7, -1],
    ]);
    expect(fe.ext[0]!.x).toBeCloseTo(4, 5);
  });
  it('Sparkonto: höchster Stand 450 € nach 5 Monaten, nach 12 Monaten −40 €', () => {
    const ap = APPS.konto;
    const C = constantFor(ap, 0, 200);
    expect(anti(ap, C, 5)).toBeCloseTo(450, 10);
    expect(anti(ap, C, 12)).toBeCloseTo(-40, 10);
  });
  it('Heißluftballon: Gipfel nach 10 min bei 600/π m, nach 20 min wieder am Boden', () => {
    const ap = APPS.ballon;
    const C = constantFor(ap, 0, 0);
    expect(anti(ap, C, 10)).toBeCloseTo(600 / Math.PI, 10);
    expect(anti(ap, C, 20)).toBeCloseTo(0, 10);
  });
  it('Aufzug: 16 m nach 10 s, 8 m nach 20 s', () => {
    expect(APPS.lift.F(10)).toBeCloseTo(16, 12);
    expect(APPS.lift.F(20)).toBeCloseTo(8, 12);
    // Halt (v = 0) zwischen Auf- und Abfahrt: zwei Flächenstücke +16 m und −8 m
    expect(pieces(APPS.lift).map((q) => q.area)).toEqual([expect.closeTo(16, 9), expect.closeTo(-8, 9)]);
  });
  it('Zimmer heizen: höchste Temperatur bei t = 2 · ln 8', () => {
    const ap = APPS.heat;
    const C = constantFor(ap, 0, 16);
    const fe = features(ap);
    expect(fe.zeros[0]!.x).toBeCloseTo(2 * Math.log(8), 8);
    expect(anti(ap, C, 2 * Math.log(8))).toBeCloseTo(24 - 1 - Math.log(8), 8);
  });
  it('Akku: Q(8) = 0,5 + 4 · (1 − e⁻⁴) Ah', () => {
    const ap = APPS.akku;
    expect(anti(ap, constantFor(ap, 0, 0.5), 8)).toBeCloseTo(0.5 + 4 * (1 - Math.exp(-4)), 12);
  });
  it('Parkhaus: am vollsten um 17 Uhr', () => {
    const ap = APPS.park;
    const C = constantFor(ap, 6, 40);
    const full = 40 + (1000 / Math.PI) * (Math.cos(Math.PI / 10) + 1);
    expect(anti(ap, C, 17)).toBeCloseTo(full, 8);
    expect(full).toBeCloseTo(661.04, 2);
  });
  it('CO₂: 1400 ppm nach 45 min, 600 ppm nach dem Lüften, Extrema an den Sprüngen', () => {
    const ap = APPS.co2;
    const C = constantFor(ap, 0, 500);
    expect(anti(ap, C, 45)).toBeCloseTo(1400, 10);
    expect(anti(ap, C, 50)).toBeCloseTo(600, 10);
    expect(anti(ap, C, 60)).toBeCloseTo(800, 10);
    expect(features(ap).zeros.map((z) => [z.x, z.sign])).toEqual([
      [45, -1],
      [50, 1],
    ]);
  });
});
