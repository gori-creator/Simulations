import { describe, expect, it } from 'vitest';
import {
  boxCritical,
  boxDeriv,
  boxOptimum,
  boxPolynomial,
  boxReducedQuadratic,
  boxSecond,
  boxVolume,
  CAN_DOMAIN,
  canDeriv,
  canHeight,
  canMinSurface,
  canOptimum,
  canSecond,
  canSurface,
  coneCylHeight,
  coneDeriv,
  coneMaxVolume,
  coneOptimum,
  coneOwnVolume,
  coneSecond,
  coneVolume,
  isGlobal,
  LIFE_GEOM,
  lifeDeriv,
  lifeNewton,
  lifeOptimum,
  lifeSecond,
  lifeSines,
  lifeStraight,
  lifeTime,
  objective,
  quality,
  rectArea,
  rectDeriv,
  rectOptimum,
  rectSecond,
  secondDeriv,
  signChange,
  type ProbKey,
  type ProbParams,
} from '../src/simulations/mathematik/extremwertprobleme/model';

/** Standardwerte der Regler */
const DEF: ProbParams = { a: 30, b: 20, v: 1000, ch: 12, cr: 6, v1: 7, v2: 2 };

describe('Modell: Extremwertprobleme', () => {
  it('Schachtel aus 30 cm × 20 cm: x ≈ 3,92 cm, V ≈ 1056,3 cm³', () => {
    const p = { a: 30, b: 20 };
    const x = boxOptimum(p);
    expect(x).toBeCloseTo(3.9237, 4);
    expect(boxVolume(p, x)).toBeCloseTo(1056.31, 2);
    expect(boxDeriv(p, x)).toBeCloseTo(0, 9);
  });
  it('quadratischer Karton a = b: x = a/6', () => {
    expect(boxOptimum({ a: 24, b: 24 })).toBeCloseTo(4, 12);
  });
  it('1-Liter-Dose: r ≈ 5,42 cm, h = 2r, O ≈ 553,6 cm²', () => {
    const r = canOptimum(1000);
    expect(r).toBeCloseTo(5.419, 3);
    expect(canHeight(1000, r)).toBeCloseTo(2 * r, 9);
    expect(canSurface(1000, r)).toBeCloseTo(553.58, 2);
    expect(canDeriv(1000, r)).toBeCloseTo(0, 9);
  });
  it('Rechteck unter 3e^(−0,5x): u = 2, A = 6/e', () => {
    expect(rectDeriv(rectOptimum)).toBe(0);
    expect(rectArea(2)).toBeCloseTo(6 / Math.E, 12);
  });
  it('Plausibilität: Optimum ist besser als zufällige zulässige Werte', () => {
    for (let i = 0; i < 50; i++) {
      const p = { a: 20 + Math.random() * 20, b: 15 + Math.random() * 10 };
      const x = Math.random() * (Math.min(p.a, p.b) / 2);
      expect(boxVolume(p, boxOptimum(p))).toBeGreaterThanOrEqual(boxVolume(p, x) - 1e-9);
      const V = 250 + Math.random() * 1750;
      const r = 1 + Math.random() * 10;
      expect(canSurface(V, canOptimum(V))).toBeLessThanOrEqual(canSurface(V, r) + 1e-9);
      const u = Math.random() * 8;
      expect(rectArea(rectOptimum)).toBeGreaterThanOrEqual(rectArea(u) - 1e-12);
    }
  });
});

describe('Modell: Zylinder im Kegel und Rettungsschwimmer', () => {
  const cone = { R: 6, H: 12 };
  it('Kegel R = 6 cm, H = 12 cm: r = 4 cm, h = 4 cm, V = 64π ≈ 201,06 cm³ (4/9 des Kegels)', () => {
    const r = coneOptimum(cone);
    expect(r).toBe(4);
    expect(coneCylHeight(cone, r)).toBe(4);
    expect(coneVolume(cone, r)).toBeCloseTo(64 * Math.PI, 10);
    expect(coneVolume(cone, r)).toBeCloseTo(201.06, 2);
    expect(coneVolume(cone, r) / ((Math.PI * 36 * 12) / 3)).toBeCloseTo(4 / 9, 12);
    expect(coneDeriv(cone, r)).toBeCloseTo(0, 10);
    expect(secondDeriv((x) => coneDeriv(cone, x), r)).toBeLessThan(0);
  });
  const life = { a: 20, b: 30, d: 60, v1: 7, v2: 2 };
  it('Rettungsschwimmer: Optimum erfüllt das Brechungsgesetz sin α₁/v₁ = sin α₂/v₂', () => {
    const x = lifeOptimum(life);
    expect(lifeDeriv(life, x)).toBeCloseTo(0, 10);
    const [s1, s2] = lifeSines(life, x);
    expect(s1 / life.v1).toBeCloseTo(s2 / life.v2, 10);
    expect(secondDeriv((u) => lifeDeriv(life, u), x)).toBeGreaterThan(0);
    // besser als gerade Linie und als „erst bis gegenüber laufen“
    const straight = (life.a * life.d) / (life.a + life.b);
    expect(straight).toBe(24);
    expect(lifeTime(life, x)).toBeLessThan(lifeTime(life, straight));
    expect(lifeTime(life, x)).toBeLessThan(lifeTime(life, 60));
  });
  it('Rettungsschwimmer: Werte nachgerechnet', () => {
    // gerade Linie: √(20² + 24²)/7 + √(30² + 36²)/2 = 31,24/7 + 46,86/2
    expect(lifeTime(life, 24)).toBeCloseTo(Math.sqrt(976) / 7 + Math.sqrt(2196) / 2, 12);
    expect(lifeTime(life, 24)).toBeCloseTo(27.894, 3);
    // bis gegenüber laufen, dann 30 m schwimmen: √(400 + 3600)/7 + 15
    expect(lifeTime(life, 60)).toBeCloseTo(Math.sqrt(4000) / 7 + 15, 12);
    const x = lifeOptimum(life);
    expect(x).toBeCloseTo(51.706, 3);
    expect(lifeTime(life, x)).toBeCloseTo(23.483, 3);
    expect(lifeTime(life, 60)).toBeCloseTo(24.035, 3);
  });
  it('gleich schnell: Optimum ist die gerade Linie', () => {
    expect(lifeOptimum({ ...life, v2: 7 })).toBeCloseTo(24, 9);
  });
});

describe('Modell: Prüfwerte der Leitung', () => {
  it('Schachtel 30 cm × 30 cm: V(x) = x(30 − 2x)², Optimum x = 5 cm, V = 2000 cm³', () => {
    const p = { a: 30, b: 30 };
    expect(boxOptimum(p)).toBeCloseTo(5, 12);
    expect(boxVolume(p, 5)).toBe(2000);
    expect(boxVolume(p, 3)).toBe(3 * 24 * 24);
    // V′ = 0 ⇔ x² − 20x + 75 = 0 ⇔ x = 5 oder x = 15 (Rand)
    expect(boxReducedQuadratic(p)).toEqual([1, -20, 75]);
    const [x1, x2] = boxCritical(p);
    expect(x1).toBeCloseTo(5, 12);
    expect(x2).toBeCloseTo(15, 12);
  });
  it('Schachtel 16 cm × 10 cm: V(x) = 4x³ − 52x² + 160x, Nullstellen von V′ bei 2 und 20/3, Optimum x = 2, V = 144 cm³', () => {
    const p = { a: 16, b: 10 };
    expect(boxPolynomial(p)).toEqual([4, -52, 160]);
    for (const x of [0.7, 1.5, 3.2, 4.9]) expect(boxVolume(p, x)).toBeCloseTo(4 * x ** 3 - 52 * x ** 2 + 160 * x, 10);
    expect(boxReducedQuadratic(p)).toEqual([3, -26, 40]);
    const [x1, x2] = boxCritical(p);
    expect(x1).toBeCloseTo(2, 12);
    expect(x2).toBeCloseTo(20 / 3, 12);
    // 20/3 liegt außerhalb von 0 < x < 5
    expect(x2).toBeGreaterThan(Math.min(p.a, p.b) / 2);
    expect(boxOptimum(p)).toBeCloseTo(2, 12);
    expect(boxVolume(p, 2)).toBe(144);
    expect(boxVolume(p, 2)).toBe(2 * 12 * 6);
    expect(boxSecond(p, 2)).toBe(48 - 104);
  });
  it('Schachtel: zweite Nullstelle von V′ liegt nie im Inneren, V″ < 0 im Optimum', () => {
    for (let a = 16; a <= 40; a++) {
      for (let b = 10; b <= 30; b++) {
        const p = { a, b };
        const [x1, x2] = boxCritical(p);
        const hi = Math.min(a, b) / 2;
        expect(x1).toBeGreaterThan(0);
        expect(x1).toBeLessThan(hi);
        expect(x2).toBeGreaterThanOrEqual(hi - 1e-9);
        expect(boxSecond(p, x1)).toBeLessThan(0);
        expect(boxDeriv(p, x1)).toBeCloseTo(0, 8);
        expect(boxSecond(p, x1)).toBeCloseTo(secondDeriv((x) => boxDeriv(p, x), x1), 5);
      }
    }
  });
  it('Dose V = 1000 cm³: r ≈ 5,419 cm, h = 2r ≈ 10,84 cm, O = 6πr² ≈ 553,6 cm²', () => {
    const r = canOptimum(1000);
    expect(r).toBeCloseTo(5.4193, 4);
    expect(canHeight(1000, r)).toBeCloseTo(10.839, 3);
    expect(canMinSurface(1000)).toBeCloseTo(553.58, 2);
    expect(canMinSurface(1000)).toBeCloseTo(canSurface(1000, r), 9);
    expect(canSecond(1000, r)).toBeCloseTo(12 * Math.PI, 9);
    expect(canSecond(1000, r)).toBeCloseTo(secondDeriv((x) => canDeriv(1000, x), r), 5);
  });
  it('Dose: bei jedem Volumen ist die beste Dose so hoch wie breit', () => {
    for (let V = 250; V <= 2000; V += 50) {
      const r = canOptimum(V);
      expect(canHeight(V, r)).toBeCloseTo(2 * r, 9);
      expect(r).toBeGreaterThan(CAN_DOMAIN[0]);
      expect(r).toBeLessThan(CAN_DOMAIN[1]);
    }
  });
  it('Rechteck unter 3e^(−0,5x): A(u) = 3u·e^(−0,5u), Optimum u = 2, A = 6/e ≈ 2,207', () => {
    expect(rectArea(2)).toBeCloseTo(2.2073, 4);
    expect(rectSecond(2)).toBeCloseTo(-1.5 / Math.E, 12);
    expect(rectSecond(1.3)).toBeCloseTo(secondDeriv(rectDeriv, 1.3), 6);
    expect(rectDeriv(1)).toBeGreaterThan(0);
    expect(rectDeriv(3)).toBeLessThan(0);
  });
  it('Zylinder im Kegel: r = 2R/3, V = 4πR²H/27 für viele R, H', () => {
    for (let R = 3; R <= 10; R += 0.5) {
      for (let H = 6; H <= 18; H += 1) {
        const c = { R, H };
        const r = coneOptimum(c);
        expect(r).toBeCloseTo((2 * R) / 3, 12);
        expect(coneCylHeight(c, r)).toBeCloseTo(H / 3, 12);
        expect(coneVolume(c, r)).toBeCloseTo(coneMaxVolume(c), 9);
        expect(coneMaxVolume(c)).toBeCloseTo((4 * Math.PI * R * R * H) / 27, 9);
        expect(coneMaxVolume(c) / coneOwnVolume(c)).toBeCloseTo(4 / 9, 12);
        expect(coneSecond(c, r)).toBeLessThan(0);
        expect(coneSecond(c, r)).toBeCloseTo(secondDeriv((x) => coneDeriv(c, x), r), 4);
      }
    }
  });
  it('Rettungsschwimmer: Brechungsgesetz im numerischen Optimum für Zufallswerte', () => {
    for (let i = 0; i < 200; i++) {
      const l = { a: 5 + Math.random() * 40, b: 5 + Math.random() * 40, d: 10 + Math.random() * 90, v1: 1 + Math.random() * 7, v2: 1 + Math.random() * 7 };
      const x = lifeOptimum(l);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(l.d);
      const [s1, s2] = lifeSines(l, x);
      expect(s1 / l.v1).toBeCloseTo(s2 / l.v2, 9);
      expect(lifeSecond(l, x)).toBeGreaterThan(0);
      expect(lifeSecond(l, x)).toBeCloseTo(secondDeriv((u) => lifeDeriv(l, u), x), 4);
      // nicht schlechter als 40 zufällige andere Wege
      for (let k = 0; k < 40; k++) expect(lifeTime(l, x)).toBeLessThanOrEqual(lifeTime(l, Math.random() * l.d) + 1e-12);
    }
  });
  it('Rettungsschwimmer: Newton-Verfahren erreicht das Optimum in wenigen Schritten', () => {
    const l = { ...LIFE_GEOM, v1: 7, v2: 2 };
    const xs = lifeNewton(l, 30, 6);
    expect(xs[0]).toBe(30);
    expect(xs.length).toBe(7);
    expect(xs[6]).toBeCloseTo(lifeOptimum(l), 9);
    expect(lifeStraight(l)).toBe(24);
  });
  it('Rettungsschwimmer: langsames Schwimmen verschiebt den Einstieg zur Person', () => {
    const fast = lifeOptimum({ ...LIFE_GEOM, v1: 4, v2: 4 });
    const slow = lifeOptimum({ ...LIFE_GEOM, v1: 8, v2: 1 });
    expect(fast).toBeCloseTo(24, 9);
    expect(slow).toBeGreaterThan(fast);
    // schneller schwimmen als laufen: Einstieg früher als die gerade Linie
    expect(lifeOptimum({ ...LIFE_GEOM, v1: 2, v2: 8 })).toBeLessThan(24);
  });
});

describe('Modell: gemeinsame Zielfunktion', () => {
  const keys: ProbKey[] = ['box', 'can', 'rect', 'cone', 'life'];
  it('Optimum liegt im Bereich, Ableitung ist dort null, Art stimmt', () => {
    for (const k of keys) {
      const o = objective(k, DEF);
      expect(o.opt).toBeGreaterThan(o.lo);
      expect(o.opt).toBeLessThan(o.hi);
      expect(o.d1(o.opt)).toBeCloseTo(0, 8);
      if (o.kind === 'max') expect(o.d2(o.opt)).toBeLessThan(0);
      else expect(o.d2(o.opt)).toBeGreaterThan(0);
      expect(signChange(o, o.opt).kind).toBe(o.kind);
      expect(isGlobal(o)).toBe(true);
      expect(quality(o, o.opt)).toBeCloseTo(1, 12);
      for (let i = 1; i < 20; i++) {
        const x = o.lo + ((o.hi - o.lo) * i) / 20;
        expect(quality(o, x)).toBeLessThanOrEqual(1 + 1e-12);
      }
    }
  });
  it('Werte der Zielfunktion stimmen mit den Einzelfunktionen überein', () => {
    expect(objective('box', DEF).f(3)).toBe(boxVolume({ a: 30, b: 20 }, 3));
    expect(objective('can', DEF).f(4)).toBe(canSurface(1000, 4));
    expect(objective('cone', { ...DEF, cr: 9, ch: 15 }).opt).toBe(6);
    expect(objective('life', DEF).ends[1]).toEqual({ kind: 'value', x: 60, y: lifeTime({ ...LIFE_GEOM, v1: 7, v2: 2 }, 60) });
    expect(objective('rect', DEF).opt).toBe(2);
  });
  it('Rettungsschwimmer: Randwerte T(0) ≈ 36,40 s und T(60) ≈ 24,04 s sind schlechter als das Optimum', () => {
    const o = objective('life', DEF);
    const [e0, e1] = o.ends;
    expect(e0.kind === 'value' && e0.y).toBeCloseTo(36.4, 2);
    expect(e1.kind === 'value' && e1.y).toBeCloseTo(24.035, 3);
    expect(o.f(o.opt)).toBeLessThan(24.035);
  });
});
