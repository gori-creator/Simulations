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

  it('behandelt die Sonderfälle α = 0°, α = 90°, μ = 0 und die Haftgrenze tan α = μ_H', () => {
    // α = 0°: keine Hangabtriebskraft, F_N = F_G, Klotz bleibt liegen
    const flat = inclineForces(1, 0, 0.5, 0.3);
    expect(flat.FH).toBe(0);
    expect(slideStep({ s: 0.4, v: 0 }, 1, flat, 0, 0.01).resting).toBe(true);
    // α = 90°: F_H = F_G, F_N = 0, keine Reibung, freier Fall a = g
    const wall = inclineForces(1, 90, 0.5, 0.3);
    expect(wall.FH).toBeCloseTo(G, 12);
    expect(wall.FN).toBeCloseTo(0, 12);
    expect(wall.FRmax).toBeCloseTo(0, 12);
    expect(slideAcceleration(90, 0.3)).toBeCloseTo(G, 12);
    // μ = 0: Grenzwinkel 0°, schon bei 1° rutscht der Klotz
    expect(limitAngle(0)).toBe(0);
    expect(limitAngle(-1)).toBe(0);
    expect(slideStep({ s: 0.4, v: 0 }, 1, inclineForces(1, 1, 0, 0), 0, 0.01).resting).toBe(false);
    // genau an der Haftgrenze (tan α = μ_H) gilt F_H = F_R,max – der Klotz haftet gerade noch
    const ag = limitAngle(0.5);
    const edge = inclineForces(1, ag, 0.5, 0.3);
    expect(edge.FH).toBeCloseTo(edge.FRmax, 12);
    expect(Math.tan(rad(ag))).toBeCloseTo(0.5, 12);
  });

  it('liefert die Werte aus dem Lernmaterial (Aufgaben 1–7)', () => {
    // A1: m = 2 kg, α = 30°
    const a1 = inclineForces(2, 30, 0.5, 0.3);
    expect(a1.FG).toBeCloseTo(19.62, 10);
    expect(a1.FH).toBeCloseTo(9.81, 10);
    expect(a1.FN).toBeCloseTo(16.99, 2);
    // A2: h = 34 cm, l = 1 m → F_H ≈ 3,3 N; bei 20° genauer 3,36 N
    expect(G * 0.34).toBeCloseTo(3.34, 2);
    expect(inclineForces(1, 20, ROLLING, ROLLING).FH).toBeCloseTo(3.36, 2);
    // A3: tan 25° < 0,5 → haftet; Grenzwinkel ≈ 26,6°
    expect(Math.tan(rad(25))).toBeLessThan(0.5);
    expect(limitAngle(0.5)).toBeCloseTo(26.6, 1);
    // A4: a ≈ 3,22 m/s², t für 40 cm ≈ 0,50 s
    const a4 = slideAcceleration(35, 0.3);
    expect(Math.sqrt((2 * 0.4) / a4)).toBeCloseTo(0.5, 2);
    // A5: μ_H = tan 31° ≈ 0,60; mit μ_H = 0,6 haftet der Klotz bei 30° und rutscht bei 31°
    expect(Math.tan(rad(31))).toBeCloseTo(0.6, 2);
    const at30 = inclineForces(1, 30, 0.6, 0.45);
    const at31 = inclineForces(1, 31, 0.6, 0.45);
    expect(at30.FH).toBeLessThan(at30.FRmax);
    expect(at31.FH).toBeGreaterThan(at31.FRmax);
    // A6: gleichmäßig hochziehen ≈ 6,1 N, Anfahren ≈ 8,0 N
    const a6 = inclineForces(1, 20, 0.5, 0.3);
    expect(pullUpForce(a6)).toBeCloseTo(6.12, 2);
    expect(holdRange(a6)[1]).toBeCloseTo(7.96, 2);
    // A7: Steigung 12 % → α = arctan 0,12 ≈ 6,8°, F_H/F_G = sin α ≈ 0,119
    const a7 = (Math.atan(0.12) * 180) / Math.PI;
    expect(a7).toBeCloseTo(6.84, 2);
    expect(Math.sin(rad(a7))).toBeCloseTo(0.119, 3);
  });

  it('rechnet die Beispielwerte der Ergebnisse nach (Hochziehen, Wagen, Reglergrenzen)', () => {
    // Hochziehen mit 8,5 N bei 20°: a = (8,5 − F_H − F_R) / m ≈ 2,38 m/s²
    const f = inclineForces(1, 20, 0.5, 0.3);
    expect((8.5 - f.FH - f.FRslide) / 1).toBeCloseTo(2.38, 2);
    // Wagen mit 3 N bei 20°: rollt mit a ≈ 0,31 m/s² hinab
    const c = inclineForces(1, 20, ROLLING, ROLLING);
    expect((c.FH - 3 - c.FRslide) / 1).toBeCloseTo(0.31, 2);
    // Reglergrenze α = 70°, m = 5 kg: F_H ≈ 46,09 N, F_N ≈ 16,78 N, Haltebereich 37,70 N bis 54,48 N
    const big = inclineForces(5, 70, 0.5, 0.3);
    expect(big.FH).toBeCloseTo(46.09, 2);
    expect(big.FN).toBeCloseTo(16.78, 2);
    const [lo, hi] = holdRange(big);
    expect(lo).toBeCloseTo(37.7, 2);
    expect(hi).toBeCloseTo(54.48, 2);
    // Stahl auf Eis bei 10°: a ≈ 1,61 m/s²
    expect(slideAcceleration(10, MATERIALS.ice.muG)).toBeCloseTo(1.61, 2);
  });
});
