import { describe, expect, it } from 'vitest';
import {
  APPS,
  chainFn,
  DEFAULT_COEFFS,
  deriv,
  dq,
  dqCentral,
  dqLeft,
  dqRight,
  extremumKind,
  features,
  FNS,
  mathFn,
  oneSided,
  powFn,
  productIncrement,
  PROD,
  quotientTable,
  rateSketch,
  secantEnds,
  secantSlope,
  signTable,
  spline,
  zeros,
  type AppKey,
  type FnKey,
} from '../src/simulations/mathematik/ableitungsfunktion/model';

describe('Modell: Ableitungsfunktion grafisch', () => {
  it('Extremstellen von (x³ − 6x)/4 bei ±√2, Wendestelle bei 0', () => {
    const fn = FNS.cub;
    const z = zeros(fn.d1, -3.5, 3.5);
    expect(z.length).toBe(2);
    expect(z[0]).toBeCloseTo(-Math.SQRT2, 9);
    expect(z[1]).toBeCloseTo(Math.SQRT2, 9);
    expect(extremumKind(fn, z[0]!)).toBe('max');
    expect(extremumKind(fn, z[1]!)).toBe('min');
    expect(zeros(fn.d2, -3.5, 3.5)[0]).toBeCloseTo(0, 9);
  });
  it('0,1x⁴ − x² + 1: Extrema bei 0 und ±√5, Wendestellen bei ±√(5/3)', () => {
    const fn = FNS.quart;
    const z = zeros(fn.d1, -3.6, 3.6);
    expect(z.map((x) => Number(x.toFixed(6)))).toEqual([-2.236068, 0, 2.236068]);
    expect(extremumKind(fn, 0)).toBe('max');
    const w = zeros(fn.d2, -3.6, 3.6);
    expect(w[1]).toBeCloseTo(Math.sqrt(5 / 3), 9);
  });
  it('sin′ = cos: Hochpunkt bei π/2', () => {
    expect(extremumKind(FNS.sin, Math.PI / 2)).toBe('max');
    expect(FNS.sin.d1(0)).toBe(1);
  });
  it('Sekantensteigung nähert die Ableitung', () => {
    for (const fn of Object.values(FNS)) {
      for (let i = 0; i < 20; i++) {
        const x = fn.x[0] + Math.random() * (fn.x[1] - fn.x[0] - 0.1);
        expect(secantSlope(fn, x, 1e-6)).toBeCloseTo(fn.d1(x), 4);
        expect((fn.d1(x + 1e-6) - fn.d1(x)) / 1e-6).toBeCloseTo(fn.d2(x), 3);
      }
    }
  });
});

describe('Modell: Funktionen mit Koeffizienten', () => {
  it('Standardwerte geben die Funktionen der ersten Fassung wieder', () => {
    for (const key of ['par', 'cub', 'quart', 'sin', 'exp'] as const) {
      const a = mathFn(key, DEFAULT_COEFFS);
      const b = FNS[key];
      for (const x of [-1.7, -0.3, 0.5, 1.9]) {
        expect(a.f(x)).toBeCloseTo(b.f(x), 12);
        expect(a.d1(x)).toBeCloseTo(b.d1(x), 12);
        expect(a.d2(x)).toBeCloseTo(b.d2(x), 12);
      }
    }
    // vorhandener Prüfwert: f′(0,5) für (x³ − 6x)/4
    expect(mathFn('cub').d1(0.5)).toBeCloseTo(-1.3125, 12);
  });

  it('f(x) = x³ − 3x: f′(2) = 9, Extremstellen ±1, Wendestelle 0', () => {
    const fn = mathFn('cub', { ...DEFAULT_COEFFS, k3: 1, k2: 0, k1: -3, k0: 0 });
    expect(fn.d1(2)).toBeCloseTo(9, 12);
    expect(fn.d2(0)).toBe(0);
    const fe = features(fn);
    expect(fe.ext.map((e) => [Number(e.x.toFixed(8)), e.kind])).toEqual([
      [-1, 'max'],
      [1, 'min'],
    ]);
    expect(fe.infl.length).toBe(1);
    expect(fe.infl[0]!.x).toBeCloseTo(0, 8);
    expect(fe.infl[0]!.saddle).toBe(false);
    // Hochpunkt (−1 | 2), Tiefpunkt (1 | −2)
    expect(fn.f(-1)).toBeCloseTo(2, 12);
    expect(fn.f(1)).toBeCloseTo(-2, 12);
  });

  it('x³: Terrassenpunkt (Sattelpunkt) bei 0 – Nullstelle von f′ ohne Vorzeichenwechsel', () => {
    const fn = mathFn('cub', { ...DEFAULT_COEFFS, k3: 1, k2: 0, k1: 0, k0: 0 });
    const fe = features(fn);
    expect(fe.ext.length).toBe(1);
    expect(fe.ext[0]!.kind).toBe('saddle');
    expect(fe.ext[0]!.x).toBeCloseTo(0, 6);
    expect(fe.infl.length).toBe(1);
    expect(fe.infl[0]!.saddle).toBe(true);
  });

  it('Lehrbuchwerte: sin, eˣ, ln, √x', () => {
    expect(mathFn('sin').d1(Math.PI / 3)).toBeCloseTo(0.5, 12);
    expect(mathFn('exp').d1(1)).toBeCloseTo(Math.E, 12);
    expect(mathFn('exp').d1(1)).toBeCloseTo(2.718281828, 8);
    expect(mathFn('ln').d1(4)).toBeCloseTo(0.25, 12);
    expect(mathFn('sqrt').d1(4)).toBeCloseTo(0.25, 12);
    expect(mathFn('cos').d1(Math.PI / 2)).toBeCloseTo(-1, 12);
    expect(mathFn('inv').d1(2)).toBeCloseTo(-0.25, 12);
    // Faktor und Frequenz: (2 sin 3x)′ = 6 cos 3x
    const s = mathFn('sin', { ...DEFAULT_COEFFS, sa: 2, sb: 3 });
    expect(s.d1(0)).toBeCloseTo(6, 12);
    // (3 e^(0,5x))′ = 1,5 e^(0,5x)
    const e = mathFn('exp', { ...DEFAULT_COEFFS, ea: 3, eb: 0.5 });
    expect(e.d1(0)).toBeCloseTo(1.5, 12);
    expect(e.d2(0)).toBeCloseTo(0.75, 12);
  });

  it('alle Ableitungen stimmen mit dem Differenzenquotienten überein', () => {
    const keys: FnKey[] = ['par', 'cub', 'quart', 'sin', 'cos', 'exp', 'ln', 'sqrt', 'abs', 'inv', 'own'];
    for (const key of keys) {
      const fn = mathFn(key);
      for (let i = 1; i < 30; i++) {
        const x = fn.dom[0] + ((fn.dom[1] - fn.dom[0]) * i) / 30 + 0.0137;
        if ((fn.kinks ?? []).some((k) => Math.abs(k - x) < 0.01) || (fn.poles ?? []).some((k) => Math.abs(k - x) < 0.2)) continue;
        if (key === 'own' && Math.abs(x - Math.round(x)) < 0.01) continue;
        expect(deriv(fn.f, x, 1e-6), `${key} f′(${x})`).toBeCloseTo(fn.d1(x), 4);
        expect(deriv(fn.d1, x, 1e-6), `${key} f″(${x})`).toBeCloseTo(fn.d2(x), 3);
      }
    }
  });

  it('|x|: Knick bei 0 – links −1, rechts 1, nicht differenzierbar, Tiefpunkt', () => {
    const fn = mathFn('abs');
    const os = oneSided(fn, 0);
    expect(os.right).toBeCloseTo(1, 9);
    expect(os.left).toBeCloseTo(-1, 9);
    expect(os.differentiable).toBe(false);
    expect(oneSided(fn, 1).differentiable).toBe(true);
    expect(oneSided(mathFn('par'), 1).differentiable).toBe(true);
    const fe = features(fn);
    expect(fe.ext).toEqual([{ x: 0, kind: 'min', kink: true }]);
    // verschoben: −2|x − 1| hat bei 1 einen Hochpunkt (Knick)
    const g = mathFn('abs', { ...DEFAULT_COEFFS, aa: -2, ab: 1 });
    expect(features(g).ext[0]).toEqual({ x: 1, kind: 'max', kink: true });
    expect(dqRight(g.f, 1, 0.5)).toBeCloseTo(-2, 12);
    expect(dqLeft(g.f, 1, 0.5)).toBeCloseTo(2, 12);
  });

  it('1/x: keine Extrem- und Wendestellen, Polstelle wird übersprungen', () => {
    const fe = features(mathFn('inv'));
    expect(fe.ext.length).toBe(0);
    expect(fe.infl.length).toBe(0);
    const tab = signTable(mathFn('inv'));
    expect(tab.map((s) => [s.d1, s.d2])).toEqual([
      [-1, -1],
      [-1, 1],
    ]);
  });
});

describe('Modell: Differenzenquotient', () => {
  const sq = (x: number) => x * x;
  it('x² an der Stelle 1 mit h = 0,1: rechts 2,1, links 1,9, beidseitig 2', () => {
    expect(dqRight(sq, 1, 0.1)).toBeCloseTo(2.1, 12);
    expect(dqLeft(sq, 1, 0.1)).toBeCloseTo(1.9, 12);
    expect(dqCentral(sq, 1, 0.1)).toBeCloseTo(2, 12);
    expect(dq(sq, 1, 0.1, 'r')).toBeCloseTo(2.1, 12);
    expect(dq(sq, 1, 0.1, 'l')).toBeCloseTo(1.9, 12);
    expect(secantEnds(1, 0.1, 'c')).toEqual([0.9, 1.1]);
  });
  it('Tabelle: der Fehler des einseitigen Quotienten von x² ist genau h', () => {
    const tab = quotientTable(sq, 1, [1, 0.5, 0.1, 0.01]);
    for (const row of tab) {
      expect(row.r - 2).toBeCloseTo(row.h, 10);
      expect(2 - row.l).toBeCloseTo(row.h, 10);
      expect(row.c).toBeCloseTo(2, 10);
    }
  });
  it('alte Funktion secantSlope entspricht dem rechtsseitigen Quotienten', () => {
    expect(secantSlope({ f: sq }, 3, 0.5)).toBeCloseTo(6.5, 12);
  });
});

describe('Modell: Alltagsbeispiele', () => {
  it('Auto: v(10) = 15 m/s (54 km/h), a(10) = 0, s(20) = 200 m, v(20) = 0', () => {
    const c = APPS.car;
    expect(c.d1(10)).toBeCloseTo(15, 12);
    expect(c.d2(10)).toBeCloseTo(0, 12);
    expect(c.f(20)).toBeCloseTo(200, 12);
    expect(c.d1(20)).toBeCloseTo(0, 12);
    expect(features(c).infl[0]!.x).toBeCloseTo(10, 6);
  });
  it('Sprint: a(0) = 9,2 m/s², 100 m nach etwa 9,94 s', () => {
    const s = APPS.sprint;
    expect(s.d2(0)).toBeCloseTo(9.2, 12);
    expect(s.d1(10)).toBeCloseTo(11.5 * (1 - Math.exp(-8)), 12);
    expect(s.f(9.9)).toBeLessThan(100);
    expect(s.f(9.95)).toBeGreaterThan(100);
  });
  it('Fahrstuhl: v(8) = 10π/16 ≈ 1,96 m/s, h(16) = 20 m', () => {
    expect(APPS.lift.d1(8)).toBeCloseTo((10 * Math.PI) / 16, 12);
    expect(APPS.lift.f(16)).toBeCloseTo(20, 12);
  });
  it('Hochwurf: höchster Punkt bei t = 12/9,81 s, a = −9,81 m/s²', () => {
    const fe = features(APPS.ball);
    expect(fe.ext.length).toBe(1);
    expect(fe.ext[0]!.kind).toBe('max');
    expect(fe.ext[0]!.x).toBeCloseTo(12 / 9.81, 6);
    expect(APPS.ball.f(12 / 9.81)).toBeCloseTo(1.5 + 144 / (4 * 4.905), 9);
  });
  it('Temperatur: höchste 20 °C um 15 Uhr, tiefste 8 °C um 3 Uhr, schnellster Anstieg π/2 K/h um 9 Uhr', () => {
    const t = APPS.temp;
    const fe = features(t);
    expect(fe.ext.map((e) => [Number(e.x.toFixed(6)), e.kind])).toEqual([
      [3, 'min'],
      [15, 'max'],
    ]);
    expect(t.f(15)).toBeCloseTo(20, 12);
    expect(t.d1(9)).toBeCloseTo(Math.PI / 2, 12);
    expect(fe.infl.map((w) => Number(w.x.toFixed(6)))).toEqual([9, 21]);
  });
  it('Infektionen: größte Zuwachsrate 1000 pro Tag bei t = ln(199)/0,4 (Wendepunkt)', () => {
    const p = APPS.pop;
    const tw = Math.log(199) / 0.4;
    expect(p.d1(tw)).toBeCloseTo(1000, 6);
    expect(p.f(tw)).toBeCloseTo(5000, 6);
    expect(features(p).infl[0]!.x).toBeCloseTo(tw, 5);
  });
  it('Kosten: Grenzkosten K′(5) = 2,5 GE/ME, Wendestelle (Kostenkehre) bei x = 5', () => {
    expect(APPS.cost.d1(5)).toBeCloseTo(2.5, 12);
    expect(APPS.cost.f(0)).toBe(20);
    expect(features(APPS.cost).infl[0]!.x).toBeCloseTo(5, 6);
    expect(features(APPS.cost).ext.length).toBe(0);
  });
  it('Wanderung: steilste Stelle bei x = 5 − √2 mit etwa 171,6 m/km ≈ 17,2 %', () => {
    const h = APPS.hike;
    const x = 5 - Math.SQRT2;
    expect(h.d1(x)).toBeCloseTo(200 * Math.SQRT2 * Math.exp(-0.5), 9);
    expect(h.d1(x)).toBeCloseTo(171.55, 1);
    expect(h.d1(x) / 10).toBeCloseTo(17.2, 1);
    expect(features(h).infl[0]!.x).toBeCloseTo(x, 5);
  });
  it('Badewanne: Zufluss 7,5π ≈ 23,56 L/min bei t = 5 min, voll (150 L) bei 10 min', () => {
    expect(APPS.tank.d1(5)).toBeCloseTo(7.5 * Math.PI, 12);
    expect(APPS.tank.f(10)).toBeCloseTo(150, 12);
  });
  it('alle Beispiele: Ableitungen passen zum Differenzenquotienten', () => {
    for (const key of Object.keys(APPS) as AppKey[]) {
      const fn = APPS[key];
      for (let i = 1; i < 20; i++) {
        const x = fn.dom[0] + ((fn.dom[1] - fn.dom[0]) * i) / 20;
        const s = Math.max(1, Math.abs(fn.d1(x)));
        expect(deriv(fn.f, x, 1e-5) / s, `${key} f′`).toBeCloseTo(fn.d1(x) / s, 5);
        expect(deriv(fn.d1, x, 1e-5) / Math.max(1, Math.abs(fn.d2(x))), `${key} f″`).toBeCloseTo(fn.d2(x) / Math.max(1, Math.abs(fn.d2(x))), 4);
      }
    }
  });
});

describe('Modell: Regeln und Skizze', () => {
  it('Potenzregel: (x³)′ = 3x², (x⁻¹)′ = −x⁻²', () => {
    expect(powFn(3).d1(2)).toBeCloseTo(12, 12);
    expect(powFn(-1).d1(2)).toBeCloseTo(-0.25, 12);
    expect(powFn(0).d1(1.3)).toBe(0);
    expect(powFn(1).d1(-1.3)).toBe(1);
  });
  it('Produktregel: (u·v)′(2) = u′v + uv′ = 3, Zuwachs zerfällt in drei Streifen', () => {
    const x = 2;
    expect(PROD.du() * PROD.v(x) + PROD.u(x) * PROD.dv(x)).toBeCloseTo(3, 12);
    const inc = productIncrement(x, 0.5);
    expect(inc.vdu + inc.udv + inc.dudv).toBeCloseTo(inc.total, 12);
    // Zuwachs/Δx → 3 für Δx → 0
    expect(productIncrement(x, 1e-6).total / 1e-6).toBeCloseTo(3, 5);
  });
  it('Kettenregel: (sin 2x)′ = 2 cos 2x', () => {
    expect(chainFn(2).d1(0)).toBe(2);
    expect(chainFn(2).d1(Math.PI / 4)).toBeCloseTo(0, 12);
  });
  it('Spline gibt lineare Daten exakt wieder', () => {
    const sp = spline([0, 1, 2, 4], [1, 3, 5, 9]);
    expect(sp.f(3)).toBeCloseTo(7, 12);
    expect(sp.d(1.5)).toBeCloseTo(2, 12);
    expect(sp.dd(1.5)).toBeCloseTo(0, 12);
  });
  it('Skizze: richtige Werte von f′ ergeben „sehr gut“, eine Nulllinie nicht', () => {
    const fn = mathFn('par');
    const good = rateSketch(fn, fn.nodes, fn.nodes.map((x) => fn.d1(x)));
    expect(good.grade).toBe(3);
    expect(good.mean).toBeCloseTo(0, 9);
    const flat = rateSketch(fn, fn.nodes, fn.nodes.map(() => 0));
    expect(flat.grade).toBeLessThan(2);
  });
});
