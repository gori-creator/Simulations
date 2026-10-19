import { describe, expect, it } from 'vitest';
import {
  APPS,
  areaParts,
  DEFAULT_COEFFS,
  erf,
  features,
  FNS,
  integralFn,
  integrate,
  mathFn,
  quotientTable,
  riemann,
  riemannBoxes,
  stripMean,
  stripRange,
  zeros,
  type Coeffs,
} from '../src/simulations/mathematik/hauptsatz/model';

const C = (c: Partial<Coeffs>): Coeffs => ({ ...DEFAULT_COEFFS, ...c });

describe('Modell: Integralfunktion und Hauptsatz', () => {
  it('∫₁³ x dx = 9/2 − 1/2 = 4; I_a(a) = 0', () => {
    expect(integralFn(FNS.lin, 1, 3)).toBe(4);
    expect(integralFn(FNS.lin, 1, 1)).toBe(0);
  });
  it('∫₀^π cos x dx = 0 und ∫₀^(π/2) cos x dx = 1', () => {
    expect(integralFn(FNS.cos, 0, Math.PI)).toBeCloseTo(0, 14);
    expect(integralFn(FNS.cos, 0, Math.PI / 2)).toBeCloseTo(1, 14);
  });
  it('Streifen: (I(x + h) − I(x))/h → f(x) für h → 0', () => {
    const fn = FNS.par;
    const x = 1.5;
    const errs = [1, 0.1, 0.01].map((h) => Math.abs(stripMean(fn, x, h) - fn.f(x)));
    expect(errs[1]).toBeLessThan(errs[0]!);
    expect(errs[2]).toBeLessThan(errs[1]!);
    expect(errs[2]).toBeLessThan(0.01);
  });
  it('Plausibilität: F(b) − F(a) stimmt mit dem numerischen Integral überein', () => {
    for (const fn of Object.values(FNS)) {
      for (let i = 0; i < 20; i++) {
        const a = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        const b = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0]);
        expect(integralFn(fn, a, b)).toBeCloseTo(integrate(fn.f, a, b), 7);
      }
    }
  });

  it('Lehrbuchwerte: ∫₋₁² (0,5x² − 1) dx = −1,5; ∫₀^π sin x dx = 2; ∫₁^e 1/x dx = 1; ∫₀² x³ dx = 4', () => {
    expect(integralFn(FNS.par, -1, 2)).toBeCloseTo(-1.5, 14);
    expect(integralFn(mathFn('sin'), 0, Math.PI)).toBeCloseTo(2, 14);
    expect(integralFn(mathFn('inv'), 1, Math.E)).toBeCloseTo(1, 14);
    expect(integralFn(mathFn('par', C({ k3: 1, k2: 0, k1: 0, k0: 0 })), 0, 2)).toBeCloseTo(4, 14);
  });

  it('Riemann-Summen für x² auf [0; 2] mit n = 4: links 1,75, rechts 3,75, Mitte 2,625, Trapez 2,75', () => {
    const f = (x: number) => x * x;
    expect(riemann(f, 0, 2, 4, 'left')).toBeCloseTo(1.75, 14);
    expect(riemann(f, 0, 2, 4, 'right')).toBeCloseTo(3.75, 14);
    expect(riemann(f, 0, 2, 4, 'mid')).toBeCloseTo(2.625, 14);
    expect(riemann(f, 0, 2, 4, 'trap')).toBeCloseTo(2.75, 14);
    // Konvergenz gegen 8/3; Mittelpunkts- und Trapezfehler wie h², Mitte halb so groß wie Trapez
    const ex = 8 / 3;
    expect(Math.abs(riemann(f, 0, 2, 100, 'left') - ex)).toBeLessThan(0.05);
    expect(ex - riemann(f, 0, 2, 4, 'mid')).toBeCloseTo((riemann(f, 0, 2, 4, 'trap') - ex) / 2, 12);
    // Streifen zum Zeichnen
    const boxes = riemannBoxes(f, 0, 2, 4, 'left');
    expect(boxes.length).toBe(4);
    expect(boxes[3]).toEqual({ l: 1.5, r: 2, yl: 2.25, yr: 2.25 });
    // umgekehrte Grenzen ergeben das Negative
    expect(riemann(f, 2, 0, 4, 'left')).toBeCloseTo(-3.75, 14);
  });

  it('Polynom: Koeffizienten werden richtig verarbeitet, F′ = f', () => {
    const fn = mathFn('par', C({ k3: 0.25, k2: -1, k1: 0.5, k0: 2 }));
    for (const x of [-2, -0.5, 0, 1.3, 3]) {
      expect(fn.f(x)).toBeCloseTo(0.25 * x ** 3 - x * x + 0.5 * x + 2, 12);
      expect((fn.F(x + 1e-5) - fn.F(x - 1e-5)) / 2e-5).toBeCloseTo(fn.f(x), 6);
    }
  });

  it('Alle Funktionen und Anwendungen: F(b) − F(a) = numerisches Integral', () => {
    const fns = [
      mathFn('lin', C({ lm: -0.5, lt: 1.2 })),
      mathFn('sin', C({ sa: 2, sb: 1.5 })),
      mathFn('cos', C({ sa: -1, sb: 0.5 })),
      mathFn('exp', C({ ea: 0.5, eb: -0.8 })),
      mathFn('exp', C({ eb: 0 })),
      mathFn('inv', C({ ia: 2 })),
      mathFn('gauss', C({ gm: 0.5, gs: 0.7 })),
      ...Object.values(APPS),
    ];
    for (const fn of fns) {
      for (let i = 0; i < 12; i++) {
        const a = fn.x[0] + ((i * 0.37) % 1) * (fn.x[1] - fn.x[0]);
        const b = fn.x[0] + ((i * 0.61 + 0.2) % 1) * (fn.x[1] - fn.x[0]);
        const v = integralFn(fn, a, b);
        expect(Math.abs(v - integrate(fn.f, a, b, 4000))).toBeLessThan(1e-5 * (1 + Math.abs(v)));
      }
    }
  });

  it('Treppenfunktion: Integral stückweise, I stetig mit Knick an der Sprungstelle', () => {
    const fn = mathFn('step', C({ s1: 2, s2: -1, sj: 1 }));
    expect(integralFn(fn, -1, 3)).toBeCloseTo(2 * 2 - 1 * 2, 14);
    expect(fn.jumps).toEqual([1]);
    expect(stripMean(fn, 0.999999, 2e-6)).toBeCloseTo(0.5, 4);
    expect(stripMean(fn, 0, 0.5)).toBeCloseTo(2, 12);
  });

  it('Fehlerfunktion: bekannte Werte', () => {
    expect(erf(0)).toBe(0);
    expect(erf(0.5)).toBeCloseTo(0.5204998778130465, 13);
    expect(erf(1)).toBeCloseTo(0.8427007929497149, 13);
    expect(erf(-2)).toBeCloseTo(-0.9953222650189527, 13);
    expect(erf(3)).toBeCloseTo(0.9999779095030014, 13);
  });

  it('Anwendungen mit Lehrbuchwerten', () => {
    // Auto: 37,5 m + 225 m + 37,5 m = 300 m
    expect(integralFn(APPS.car, 0, 25)).toBeCloseTo(300, 12);
    expect(integralFn(APPS.car, 0, 5)).toBeCloseTo(37.5, 12);
    // Solaranlage: 96/π kWh
    expect(integralFn(APPS.solar, 0, 24)).toBeCloseTo(96 / Math.PI, 12);
    expect(96 / Math.PI).toBeCloseTo(30.5577, 4);
    // Stausee: größte Zunahme nach 3 Monaten 18/π, nach einem Jahr wieder 0
    expect(integralFn(APPS.lake, 0, 3)).toBeCloseTo(18 / Math.PI, 12);
    expect(integralFn(APPS.lake, 0, 12)).toBeCloseTo(0, 12);
    // Grenzkosten: ∫₀¹⁰ (0,3x² − 3x + 10) dx = 100 − 150 + 100 = 50
    expect(integralFn(APPS.cost, 0, 10)).toBeCloseTo(50, 12);
    // Medikament: 160 − 800·e^(−4) ≈ 145,35 mg in 8 h
    expect(integralFn(APPS.drug, 0, 8)).toBeCloseTo(160 - 800 * Math.exp(-4), 12);
    // Regen: 10·√(2π)·erf(3/√2) ≈ 25,0 mm
    expect(integralFn(APPS.rain, 0, 6)).toBeCloseTo(10 * Math.sqrt(2 * Math.PI) * erf(3 / Math.SQRT2), 12);
    expect(integralFn(APPS.rain, 0, 6)).toBeCloseTo(24.998, 2);
    // Atmung: 5/(2π) ≈ 0,796 L Luft pro Einatmen
    expect(integralFn(APPS.breath, 0, 2.5)).toBeCloseTo(5 / (2 * Math.PI), 12);
    // Neubaugebiet: Zuwachs 12·(1/(1 + e^(−5)) − 1/(1 + e^5))
    expect(integralFn(APPS.pop, 0, 20)).toBeCloseTo(12 * (1 / (1 + Math.exp(-5)) - 1 / (1 + Math.exp(5))), 12);
    expect(APPS.pop.f(10)).toBeCloseTo(1.5, 12);
  });

  it('Graph von f ↔ Graph von I: Nullstellen = Extremstellen, Extremstellen = Wendestellen', () => {
    // f(x) = 0,5x² − 1: Nullstellen ±√2, Tiefpunkt bei 0
    const fe = features(FNS.par);
    expect(fe.zeros.map((z) => z.x)).toEqual([expect.closeTo(-Math.SQRT2, 9), expect.closeTo(Math.SQRT2, 9)]);
    expect(fe.zeros.map((z) => z.sign)).toEqual([-1, 1]);
    expect(fe.ext).toEqual([{ x: expect.closeTo(0, 6), kind: 'min' }]);
    // Medikament: Maximum der Rate bei t = 2 h → Wendestelle der aufgenommenen Menge
    const fd = features(APPS.drug);
    expect(fd.ext[0]!.x).toBeCloseTo(2, 5);
    expect(fd.ext[0]!.kind).toBe('max');
    // Grenzkosten: Minimum bei x = 5 (Kostenkehre)
    expect(features(APPS.cost).ext[0]!.x).toBeCloseTo(5, 5);
    // Stausee: Nullstellen bei 3 und 9 Monaten
    expect(features(APPS.lake).zeros.map((z) => z.x)).toEqual([expect.closeTo(3, 8), expect.closeTo(9, 8)]);
    // x² berührt die Achse: Terrassenstelle von I
    expect(zeros((x) => x * x, -1, 1.3).map((z) => z.sign)).toEqual([0]);
    // Treppe: Sprung über null ist keine Nullstelle
    expect(zeros(mathFn('step', C({ s1: 1, s2: -1, sj: 0.3 })).f, -2, 2)).toEqual([]);
  });

  it('Andere untere Grenze verschiebt I senkrecht: I_b(x) = I_a(x) − I_a(b)', () => {
    const fn = mathFn('cos', C({ sa: 1.5, sb: 0.8 }));
    for (const x of [-3, 0.4, 2.2]) expect(integralFn(fn, 1, x)).toBeCloseTo(integralFn(fn, -2, x) - integralFn(fn, -2, 1), 12);
  });

  it('Flächenbilanz: Integral = A⁺ − A⁻, Fläche = A⁺ + A⁻', () => {
    const p = areaParts(mathFn('sin'), 0, 2 * Math.PI);
    expect(p.pos).toBeCloseTo(2, 10);
    expect(p.neg).toBeCloseTo(2, 10);
    expect(p.integral).toBeCloseTo(0, 10);
    expect(p.area).toBeCloseTo(4, 10);
    const q = areaParts(FNS.par, -1, 2);
    expect(q.integral).toBeCloseTo(-1.5, 10);
    // Fläche: |∫₋₁^√2 f| + ∫_√2² f
    const s = Math.SQRT2;
    const F = (x: number) => x ** 3 / 6 - x;
    expect(q.area).toBeCloseTo(Math.abs(F(s) - F(-1)) + (F(2) - F(s)), 10);
    expect(areaParts(FNS.par, 2, -1).integral).toBeCloseTo(1.5, 10);
  });

  it('Mittelwertsatz: min · h ≤ I(x + h) − I(x) ≤ max · h', () => {
    for (const fn of [FNS.par, FNS.cos, APPS.drug, APPS.car]) {
      for (const [x, h] of [
        [fn.x[0] + 0.3, 0.8],
        [(fn.x[0] + fn.x[1]) / 2, 1.2],
      ] as const) {
        const r = stripRange(fn, x, h);
        const m = stripMean(fn, x, h);
        expect(m).toBeGreaterThanOrEqual(r.min - 1e-9);
        expect(m).toBeLessThanOrEqual(r.max + 1e-9);
      }
    }
  });

  it('Tabelle h → 0: Fehler wird kleiner', () => {
    const t = quotientTable(FNS.par, 1.5);
    expect(t[0]!.q).toBeCloseTo((integralFn(FNS.par, 0, 2.5) - integralFn(FNS.par, 0, 1.5)) / 1, 12);
    for (let i = 1; i < t.length; i++) expect(Math.abs(t[i]!.err)).toBeLessThan(Math.abs(t[i - 1]!.err));
    expect(Math.abs(t[t.length - 1]!.err)).toBeLessThan(0.002);
  });
});
