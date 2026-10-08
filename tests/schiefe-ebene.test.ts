import { describe, expect, it } from 'vitest';
import { G, holdRange, inclineForces, limitAngle, MATERIALS, pullUpForce, ROLLING, slideAcceleration, slideStep, type SlideState } from '../src/simulations/physik/schiefe-ebene/model';

const rad = (d: number) => (d * Math.PI) / 180;

describe('Modell: Schiefe Ebene', () => {
  it('zerlegt die Gewichtskraft in Hangabtriebs- und Normalkraft', () => {
    const f = inclineForces(1, 30, 0.5, 0.3);
    expect(f.FG).toBeCloseTo(G, 12);
    expect(f.FH).toBeCloseTo(G / 2, 12);
    expect(f.FN).toBeCloseTo(G * Math.cos(rad(30)), 12);
    // F_H² + F_N² = F_G²
    expect(f.FH ** 2 + f.FN ** 2).toBeCloseTo(f.FG ** 2, 10);
    // F_H / F_G = h / l
    const h = 0.5;
    expect(f.FH / f.FG).toBeCloseTo(h / 1, 12);
    expect(f.FRmax).toBeCloseTo(0.5 * f.FN, 12);
    expect(f.FRslide).toBeCloseTo(0.3 * f.FN, 12);
    const flat = inclineForces(2, 0, 0.5, 0.3);
    expect(flat.FH).toBe(0);
    expect(flat.FN).toBeCloseTo(2 * G, 12);
  });

  it('bestimmt den Grenzwinkel tan α_G = μ_H', () => {
    expect(limitAngle(0.5)).toBeCloseTo(26.565, 3);
    expect(limitAngle(1)).toBeCloseTo(45, 12);
    expect(limitAngle(MATERIALS.ice.muH)).toBeLessThan(2);
    // knapp unter dem Grenzwinkel haftet der Klotz, knapp darüber nicht
    const below = inclineForces(1, 26, 0.5, 0.3);
    const above = inclineForces(1, 27, 0.5, 0.3);
    expect(below.FH).toBeLessThan(below.FRmax);
    expect(above.FH).toBeGreaterThan(above.FRmax);
  });

  it('berechnet die Beschleunigung beim Gleiten', () => {
    expect(slideAcceleration(35, 0.3)).toBeCloseTo(G * (Math.sin(rad(35)) - 0.3 * Math.cos(rad(35))), 12);
    expect(slideAcceleration(35, 0.3)).toBeCloseTo(3.22, 2);
    // ohne Reibung: a = g · sin α
    expect(slideAcceleration(30, 0)).toBeCloseTo(G / 2, 12);
  });

  it('kennt den Haltebereich und die Kraft zum gleichförmigen Hochziehen', () => {
    const f = inclineForces(1, 20, 0.5, 0.3);
    const [lo, hi] = holdRange(f);
    expect(lo).toBe(0); // F_H < F_R,max: hält auch ohne Zugkraft
    expect(hi).toBeCloseTo(f.FH + f.FRmax, 12);
    expect(pullUpForce(f)).toBeCloseTo(f.FH + f.FRslide, 12);
    const steep = inclineForces(1, 50, 0.5, 0.3);
    expect(holdRange(steep)[0]).toBeCloseTo(steep.FH - steep.FRmax, 12);
  });

  it('lässt einen haftenden Klotz liegen und einen rutschenden gleichmäßig beschleunigt gleiten', () => {
    const m = 1;
    const stuck = slideStep({ s: 0.3, v: 0 }, m, inclineForces(m, 20, 0.5, 0.3), 0, 0.01);
    expect(stuck.resting).toBe(true);
    expect(stuck.v).toBe(0);
    expect(stuck.friction).toBeCloseTo(-inclineForces(m, 20, 0.5, 0.3).FH, 12);

    const f = inclineForces(m, 35, 0.5, 0.3);
    let st: SlideState = { s: 0, v: 0 };
    const h = 0.001;
    for (let i = 0; i < 500; i++) st = slideStep(st, m, f, 0, h);
    const a = slideAcceleration(35, 0.3);
    expect(st.v).toBeCloseTo(a * 0.5, 6);
    expect(st.s).toBeCloseTo(0.5 * a * 0.25, 4);
  });

  it('zieht den Klotz hinauf, wenn die Zugkraft groß genug ist, und hält ihn sonst fest', () => {
    const m = 1;
    const f = inclineForces(m, 20, 0.5, 0.3);
    const up = slideStep({ s: 0.5, v: 0 }, m, f, 8.5, 0.001);
    expect(up.resting).toBe(false);
    expect(up.a).toBeCloseTo((f.FH - 8.5 + f.FRslide) / m, 12);
    expect(up.a).toBeLessThan(0);
    const hold = slideStep({ s: 0.5, v: 0 }, m, f, 7, 0.001);
    expect(hold.resting).toBe(true);
  });

  it('bremst einen nach oben geschobenen Klotz ab, bis die Haftreibung ihn hält', () => {
    const m = 1;
    const f = inclineForces(m, 10, 0.5, 0.3);
    let st: SlideState & { resting?: boolean } = { s: 0.5, v: -1 };
    let steps = 0;
    while (steps < 5000) {
      const n = slideStep(st, m, f, 0, 0.001);
      st = n;
      steps++;
      if (n.resting) break;
    }
    expect(st.v).toBe(0);
    // Bremsweg v² / (2a) mit a = g · (sin α + μ_G · cos α)
    const a = G * (Math.sin(rad(10)) + 0.3 * Math.cos(rad(10)));
    expect(0.5 - st.s).toBeCloseTo(1 / (2 * a), 2);
  });

  it('lässt den Wagen wegen der kleinen Rollreibung fast ungebremst rollen', () => {
    expect(ROLLING).toBeLessThan(0.01);
    const f = inclineForces(1, 5, ROLLING, ROLLING);
    expect(f.FH).toBeGreaterThan(f.FRmax);
  });
});
