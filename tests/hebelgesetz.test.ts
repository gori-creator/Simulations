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
});
