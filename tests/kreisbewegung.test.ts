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

  it('Aufgabenwerte aus dem Lernmaterial (von Hand nachgerechnet)', () => {
    // A1: v = 2π · 0,8 / 1,2 = 4,19 m/s; a = 21,93 m/s²; F = 4,39 N; f = 0,83 Hz; ω = 5,24 1/s
    const v = speed(0.8, 1.2);
    expect(v).toBeCloseTo(4.19, 2);
    expect(centripetalAcceleration(0.8, v)).toBeCloseTo(21.93, 2);
    expect(centripetalForce(0.2, 0.8, v)).toBeCloseTo(4.39, 2);
    expect(angularVelocity(0.8, v)).toBeCloseTo(5.236, 3);
    // A2: T = 2π · √(0,2 · 0,8 / 30) = 0,459 s; Grenzgeschwindigkeit √120 = 10,95 m/s
    expect(breakingPeriod(30, 0.2, 0.8)).toBeCloseTo(0.4589, 4);
    expect(breakingSpeed(30, 0.2, 0.8)).toBeCloseTo(10.954, 3);
    // A3: trocken 19,8 m/s = 71 km/h, nass 15,7 m/s = 56 km/h
    expect(maxCornerSpeed(ROADS.dry, 50) * 3.6).toBeCloseTo(71.3, 1);
    expect(maxCornerSpeed(ROADS.wet, 50)).toBeCloseTo(15.66, 2);
    expect(maxCornerSpeed(ROADS.wet, 50) * 3.6).toBeCloseTo(56.4, 1);
    // A5: r_min = 100 / (0,1 · 9,81) = 101,9 m
    expect(minRadius(ROADS.ice, 10)).toBeCloseTo(101.94, 2);
    // A6: Schleudern mit 1200 U/min, r = 0,25 m → f = 20 Hz, ω = 125,7 1/s, a = 3948 m/s² ≈ 402 g
    const T = 60 / 1200;
    const vw = speed(0.25, T);
    expect(1 / T).toBeCloseTo(20, 12);
    expect(angularVelocity(0.25, vw)).toBeCloseTo(125.66, 2);
    expect(centripetalAcceleration(0.25, vw)).toBeCloseTo(3947.8, 1);
    expect(centripetalAcceleration(0.25, vw) / G).toBeCloseTo(402.4, 1);
    // A7: Looping r = 6 m – oben reicht die Gewichtskraft genau als Zentripetalkraft bei v = √(g · r) = 7,67 m/s
    const vLoop = Math.sqrt(G * 6);
    expect(vLoop).toBeCloseTo(7.67, 2);
    expect(centripetalAcceleration(6, vLoop)).toBeCloseTo(G, 12);
    // Standard-Auto: 1200 kg, 15 m/s, 50 m → a = 4,5 m/s² = 0,46 g, T = 20,9 s
    expect(centripetalAcceleration(50, 15) / G).toBeCloseTo(0.4587, 4);
    expect(period(50, 15)).toBeCloseTo(20.944, 3);
  });

  it('Sonderfälle und Reglergrenzen', () => {
    // kleinster Radius, größte Umlaufdauer, kleinste Masse: winzige Kraft, aber endlich
    const vMin = speed(0.2, 3);
    expect(vMin).toBeCloseTo(0.4189, 4);
    expect(centripetalForce(0.05, 0.2, vMin)).toBeCloseTo(0.04386, 5);
    // größter Radius, kleinste Umlaufdauer, größte Masse: 1480 N – jede Schnur (≤ 100 N) reißt
    const vMax = speed(1.5, 0.2);
    expect(centripetalForce(1, 1.5, vMax)).toBeCloseTo(1480.4, 1);
    expect(breakingPeriod(100, 1, 1.5)).toBeGreaterThan(0.2);
    // Reißgrenze kann außerhalb des Reglers liegen (schwache Schnur, schwere Kugel): T_grenz > 3 s
    expect(breakingPeriod(5, 1, 1.5)).toBeCloseTo(3.441, 3);
    // T → groß: v, a, F → 0 (keine Division durch 0)
    expect(speed(0.8, 1e9)).toBeLessThan(1e-8);
    expect(centripetalForce(0.2, 0.8, speed(0.8, 1e9))).toBeLessThan(1e-16);
    // r → klein bei fester Umlaufdauer: F = m · ω² · r → 0; bei fester Geschwindigkeit dagegen F → ∞
    expect(centripetalForce(0.2, 1e-6, speed(1e-6, 1.2))).toBeLessThan(1e-5);
    expect(centripetalForce(0.2, 1e-6, 4)).toBeGreaterThan(1e6);
    // Auto: Reglergrenzen r = 10 m, v = 40 m/s, 2500 kg → 400 kN; v_max = 8,86 m/s
    expect(centripetalForce(2500, 10, 40)).toBeCloseTo(400000, 6);
    expect(maxCornerSpeed(ROADS.dry, 10)).toBeCloseTo(8.859, 3);
    // Eis, kleinste Kurve: v_max = √(0,1 · 9,81 · 10) = 3,13 m/s
    expect(maxCornerSpeed(ROADS.ice, 10)).toBeCloseTo(3.132, 3);
  });
});
