import { describe, expect, it } from 'vitest';
import {
  AXLE_FRICTION,
  balance,
  balancingForce,
  effortForce,
  G,
  isBalanced,
  loadForce,
  loadTorque,
  loadTravel,
  MAX_TILT,
  meterArm,
  meterTorque,
  PIECE_FORCE,
  restAngle,
  stepMotion,
  torqueAt,
  type Lever,
  type Motion,
} from '../src/simulations/physik/hebelgesetz/model';

describe('Modell: Hebelgesetz', () => {
  it('rechnet Massestücke in Gewichtskräfte um (50 g ≈ 0,49 N)', () => {
    expect(PIECE_FORCE).toBeCloseTo(0.05 * G, 12);
    expect(loadForce(3)).toBeCloseTo(1.4715, 10);
    expect(loadForce(0)).toBe(0);
  });

  it('erkennt das Gleichgewicht F₁ · a₁ = F₂ · a₂ (3 · 4 = 2 · 6)', () => {
    const lever: Lever = { loads: [{ n: 3, x: -4 }, { n: 2, x: 6 }], meter: null };
    const b = balance(lever);
    // links: 1,4715 N · 0,20 m; rechts: 0,981 N · 0,30 m
    expect(b.ccw).toBeCloseTo(0.2943, 10);
    expect(b.cw).toBeCloseTo(0.2943, 10);
    expect(isBalanced(lever)).toBe(true);
    expect(restAngle(lever)).toBeCloseTo(0, 9);
  });

  it('kippt zur Seite mit dem größeren Drehmoment bis zum Anschlag', () => {
    // links 2 · 6 = 12, rechts 3 · 2 = 6 → linksdrehend überwiegt
    const left: Lever = { loads: [{ n: 2, x: -6 }, { n: 3, x: 2 }], meter: null };
    expect(loadTorque({ n: 2, x: -6 })).toBeGreaterThan(0);
    expect(balance(left).net).toBeGreaterThan(0);
    expect(restAngle(left)).toBeCloseTo(MAX_TILT, 9);
    const right: Lever = { loads: [{ n: 1, x: -1 }, { n: 1, x: 2 }], meter: null };
    expect(restAngle(right)).toBeCloseTo(-MAX_TILT, 9);
    // Schon ein Massestück an Stelle 1 Unterschied reicht bis zum Anschlag
    const tiny: Lever = { loads: [{ n: 1, x: -1 }], meter: null };
    expect(restAngle(tiny)).toBeCloseTo(MAX_TILT, 9);
  });

  it('bestimmt die Kraft des Kraftmessers beim einseitigen Hebel', () => {
    // 4 Massestücke an Stelle 5, Kraftmesser an Stelle 9 zieht senkrecht nach oben
    const loads = [{ n: 4, x: 5 }];
    const F = balancingForce(loads, { x: 9, dir: 90 });
    expect(F).toBeCloseTo((4 * PIECE_FORCE * 5) / 9, 10);
    expect(F).toBeCloseTo(1.09, 10);
    const lever: Lever = { loads, meter: { x: 9, dir: 90, F: F! } };
    expect(isBalanced(lever)).toBe(true);
    // in die falsche Richtung (nach unten) geht es nicht
    expect(balancingForce(loads, { x: 9, dir: -90 })).toBeNull();
    // entlang des Hebels gezogen: kein Drehmoment
    expect(balancingForce(loads, { x: 9, dir: 0 })).toBeNull();
  });

  it('berücksichtigt beim schrägen Zug den wirksamen Kraftarm a = r · sin β', () => {
    const meter = { x: 6, dir: -60, F: 1 };
    expect(meterArm(meter)).toBeCloseTo(0.3 * Math.sin(Math.PI / 3), 12);
    expect(meterTorque(meter)).toBeCloseTo(-0.3 * Math.sin(Math.PI / 3), 12);
    const F = balancingForce([{ n: 3, x: -4 }], meter)!;
    // schräg braucht man mehr Kraft als senkrecht
    expect(F).toBeCloseTo(0.2943 / (0.3 * Math.sin(Math.PI / 3)), 10);
    expect(F).toBeGreaterThan(balancingForce([{ n: 3, x: -4 }], { x: 6, dir: -90 })!);
  });

  it('bewegt den Hebel bei sehr kleinen Unterschieden wegen der Reibung in der Achse nicht', () => {
    // Kraftmesser-Anzeige auf 0,01 N gerundet
    const lever: Lever = { loads: [{ n: 3, x: -4 }], meter: { x: 6, dir: -90, F: 0.98 } };
    expect(Math.abs(balance(lever).net)).toBeLessThan(AXLE_FRICTION);
    expect(isBalanced(lever)).toBe(true);
    expect(restAngle(lever)).toBeCloseTo(0, 9);
    expect(torqueAt(lever, 0)).toBe(0);
  });

  it('kommt gedämpft in der Ruhelage zur Ruhe', () => {
    const lever: Lever = { loads: [{ n: 3, x: -4 }, { n: 2, x: 6 }], meter: null };
    let state: Motion = { phi: -MAX_TILT, omega: 0 };
    for (let i = 0; i < 6000; i++) state = stepMotion(lever, state, 0.002);
    expect(state.phi).toBeCloseTo(0, 3);
    expect(Math.abs(state.omega)).toBeLessThan(1e-3);
    // nie über den Anschlag hinaus
    const heavy: Lever = { loads: [{ n: 8, x: -10 }], meter: null };
    state = { phi: 0, omega: 0 };
    for (let i = 0; i < 2000; i++) {
      state = stepMotion(heavy, state, 0.002);
      expect(state.phi).toBeLessThanOrEqual(MAX_TILT + 1e-12);
    }
    expect(state.phi).toBeCloseTo(MAX_TILT, 6);
  });

  it('berechnet Hebel im Alltag und die Goldene Regel', () => {
    // Schubkarre: 60 kg Ladung, Lastarm 40 cm, Kraftarm 140 cm
    const FL = 60 * G;
    const FK = effortForce(FL, 40, 140);
    expect(FK).toBeCloseTo((588.6 * 40) / 140, 9);
    expect(FK).toBeCloseTo(168.17, 2);
    expect(effortForce(FL, 40, 0)).toBe(Infinity);
    // Weg der Last ist im selben Verhältnis kleiner: F_K · s_K = F_L · s_L
    const sL = loadTravel(20, 40, 140);
    expect(sL).toBeCloseTo((20 * 40) / 140, 12);
    expect(FK * 20).toBeCloseTo(FL * sL, 9);
  });

  it('rechnet die Aufgaben aus dem Lernmaterial nach (Prüfrunde)', () => {
    // A1: 4 Stück an Stelle 3 links ↔ 3 Stück an Stelle 4 rechts (4 · 15 cm = 3 · 20 cm)
    expect(isBalanced({ loads: [{ n: 4, x: -3 }, { n: 3, x: 4 }], meter: null })).toBe(true);
    expect(isBalanced({ loads: [{ n: 4, x: -3 }, { n: 3, x: 3 }], meter: null })).toBe(false);
    // A2: 6 · 0,4905 N · 0,10 m / 0,40 m = 0,7358 N → Anzeige 0,74 N hält den Hebel (Reibung)
    const F2 = balancingForce([{ n: 6, x: -2 }], { x: 8, dir: -90 })!;
    expect(F2).toBeCloseTo(0.73575, 10);
    expect(isBalanced({ loads: [{ n: 6, x: -2 }], meter: { x: 8, dir: -90, F: 0.74 } })).toBe(true);
    // A4: wirksamer Kraftarm 0,30 m · sin 60° = 0,2598 m → 0,2943 N·m / 0,2598 m = 1,133 N
    const F4 = balancingForce([{ n: 3, x: -4 }], { x: 6, dir: -60 })!;
    expect(meterArm({ x: 6, dir: -60, F: 0 })).toBeCloseTo(0.2598, 4);
    expect(F4).toBeCloseTo(1.1328, 4);
    expect(isBalanced({ loads: [{ n: 3, x: -4 }], meter: { x: 6, dir: -60, F: 1.13 } })).toBe(true);
    // mit der senkrechten Kraft 0,98 N kippt der schräg gezogene Hebel nach links
    expect(balance({ loads: [{ n: 3, x: -4 }], meter: { x: 6, dir: -60, F: 0.98 } }).net).toBeGreaterThan(AXLE_FRICTION);
    // A5: 80 kg · 9,81 N/kg = 784,8 N; · 50/140 = 280,3 N; · 30/140 = 168,2 N
    expect(effortForce(80 * G, 50, 140)).toBeCloseTo(280.29, 2);
    expect(effortForce(80 * G, 30, 140)).toBeCloseTo(168.17, 2);
    // A6: Nussknacker 300 N · 4/16 = 75 N, Hand 4 mm bei 1 mm an der Nuss
    expect(effortForce(300, 4, 16)).toBe(75);
    expect(loadTravel(4, 4, 16)).toBe(1);
  });

  it('behandelt Last und Kraftmesser an der Drehachse (Kraftarm 0)', () => {
    expect(G).toBe(9.81);
    expect(Math.abs(loadTorque({ n: 8, x: 0 }))).toBe(0);
    const lever: Lever = { loads: [{ n: 8, x: 0 }], meter: { x: 0, dir: 90, F: 5 } };
    expect(balance(lever).net).toBe(0);
    expect(isBalanced(lever)).toBe(true);
    expect(restAngle(lever)).toBeCloseTo(0, 9);
    expect(balancingForce([{ n: 2, x: 6 }], { x: 0, dir: 90 })).toBeNull();
    // keine Massestücke: Kraftmesser muss 0 N aufbringen
    expect(balancingForce([], { x: 5, dir: 90 })).toBe(0);
  });

  it('kippt bei den größten Werten bis zum Anschlag, nie darüber', () => {
    // 8 Stück an Stelle 10 links gegen 5 N nach oben an Stelle 1 rechts: 1,962 + 0,25 N·m linksdrehend
    const lever: Lever = { loads: [{ n: 8, x: -10 }], meter: { x: 1, dir: 90, F: 5 } };
    expect(balance(lever).ccw).toBeCloseTo(8 * 0.4905 * 0.5 + 5 * 0.05, 10);
    expect(restAngle(lever)).toBeCloseTo(MAX_TILT, 9);
    // 39,24 N wären nötig, um 8 Stück an Stelle 10 mit dem Kraftmesser an Stelle 1 zu halten
    expect(balancingForce([{ n: 8, x: -10 }], { x: 1, dir: -90 })).toBeCloseTo(39.24, 10);
  });

  it('Wippe: Gleichgewicht bei m₁ · a₁ = m₂ · a₂ (40 kg · 1,5 m = 30 kg · 2 m)', () => {
    const M1 = 40 * G * 1.5;
    expect(M1).toBeCloseTo(588.6, 9);
    expect(30 * G * 1.5).toBeCloseTo(441.45, 9);
    expect(effortForce(40 * G, 150, 200)).toBeCloseTo(30 * G, 9);
  });
});
