import { describe, expect, it } from 'vitest';
import {
  angularVelocity,
  breakingPeriod,
  breakingSpeed,
  centripetalAcceleration,
  centripetalForce,
  freeFlight,
  G,
  maxCornerSpeed,
  maxFriction,
  minRadius,
  onCircle,
  period,
  ROADS,
  slidePosition,
  speed,
  tangentVelocity,
} from '../src/simulations/physik/kreisbewegung/model';

describe('Modell: Kreisbewegung und Zentripetalkraft', () => {
  it('Bahngeschwindigkeit und Umlaufdauer', () => {
    // r = 0,8 m, T = 1,2 s → v = 2π · 0,8 / 1,2 ≈ 4,189 m/s
    expect(speed(0.8, 1.2)).toBeCloseTo(4.18879, 5);
    expect(period(0.8, speed(0.8, 1.2))).toBeCloseTo(1.2, 12);
    expect(angularVelocity(0.8, speed(0.8, 1.2))).toBeCloseTo((2 * Math.PI) / 1.2, 12);
  });

  it('Zentripetalbeschleunigung a = v²/r = ω²·r und Kraft F = m·v²/r', () => {
    const v = speed(0.8, 1.2);
    const w = (2 * Math.PI) / 1.2;
    expect(centripetalAcceleration(0.8, v)).toBeCloseTo(w * w * 0.8, 12);
    expect(centripetalForce(0.2, 0.8, v)).toBeCloseTo(4.3865, 4);
    // Auto: 1200 kg, 15 m/s, r = 50 m → 5,4 kN
    expect(centripetalForce(1200, 50, 15)).toBeCloseTo(5400, 9);
  });

  it('doppelte Geschwindigkeit → vierfache Kraft; doppelter Radius bei gleichem v → halbe Kraft', () => {
    expect(centripetalForce(1, 2, 10) / centripetalForce(1, 2, 5)).toBeCloseTo(4, 12);
    expect(centripetalForce(1, 4, 5) / centripetalForce(1, 2, 5)).toBeCloseTo(0.5, 12);
    // … aber bei gleicher Umlaufdauer wächst die Kraft proportional zu r
    expect(centripetalForce(1, 4, speed(4, 1)) / centripetalForce(1, 2, speed(2, 1))).toBeCloseTo(2, 12);
  });

  it('Kurvenfahrt: v_max = √(μ·g·r), unabhängig von der Masse', () => {
    expect(maxCornerSpeed(0.8, 50)).toBeCloseTo(Math.sqrt(0.8 * 9.81 * 50), 12);
    expect(maxCornerSpeed(0.8, 50)).toBeCloseTo(19.809, 3);
    for (const m of [800, 1200, 2500]) {
      const vmax = maxCornerSpeed(ROADS.wet, 50);
      expect(centripetalForce(m, 50, vmax)).toBeCloseTo(maxFriction(ROADS.wet, m), 6);
    }
    expect(minRadius(0.5, 18)).toBeCloseTo((18 * 18) / (0.5 * G), 12);
  });

  it('Reißkraft der Schnur: Grenzgeschwindigkeit und Grenzumlaufdauer passen zusammen', () => {
    const v = breakingSpeed(30, 0.2, 0.8);
    expect(centripetalForce(0.2, 0.8, v)).toBeCloseTo(30, 10);
    expect(speed(0.8, breakingPeriod(30, 0.2, 0.8))).toBeCloseTo(v, 10);
  });

  it('Geschwindigkeit steht senkrecht auf dem Radius', () => {
    for (const phi of [0, 0.7, 2, 4.5]) {
      const [x, y] = onCircle(1.3, phi);
      const [vx, vy] = tangentVelocity(3, phi);
      expect(x * vx + y * vy).toBeCloseTo(0, 12);
      expect(Math.hypot(vx, vy)).toBeCloseTo(3, 12);
    }
  });

  it('ohne Schnur: geradlinig gleichförmig entlang der Tangente', () => {
    const start = onCircle(0.8, -Math.PI / 2);
    const vel = tangentVelocity(4, -Math.PI / 2);
    const q = freeFlight(start, vel, 0.5);
    expect(q[0]).toBeCloseTo(2, 12);
    expect(q[1]).toBeCloseTo(-0.8, 12);
  });

  it('rutschendes Auto: beginnt tangential auf der Fahrbahn und entfernt sich nach außen', () => {
    const r = 50;
    const phi0 = -Math.PI / 2;
    const v = 18;
    const p0 = slidePosition(r, phi0, v, ROADS.wet, 0);
    expect(p0[0]).toBeCloseTo(0, 9);
    expect(p0[1]).toBeCloseTo(-50, 9);
    // kurz danach: Richtung tangential (gegen den Uhrzeigersinn)
    const dt = 1e-4;
    const p1 = slidePosition(r, phi0, v, ROADS.wet, dt);
    expect((p1[0] - p0[0]) / dt).toBeCloseTo(v, 3);
    expect((p1[1] - p0[1]) / dt).toBeCloseTo(0, 3);
    // Abstand vom Kurvenmittelpunkt wächst
    let last = r;
    for (const t of [0.5, 1, 2, 3]) {
      const q = slidePosition(r, phi0, v, ROADS.wet, t);
      const d = Math.hypot(q[0], q[1]);
      expect(d).toBeGreaterThan(last);
      last = d;
    }
  });
});
