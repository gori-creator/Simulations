import { describe, expect, it } from 'vitest';
import {
  acceleratedMotion,
  brakingInfo,
  buildPhases,
  displacement,
  extent,
  isBraking,
  pathLength,
  phaseIndexAt,
  scheduleMotion,
  stateAt,
  toKmh,
  totalTime,
  uniformMotion,
} from '../src/simulations/physik/bewegungsdiagramme/model';

describe('Modell: Bewegungsdiagramme', () => {
  it('beschreibt die gleichförmige Bewegung s = s₀ + v·t', () => {
    const phases = buildPhases(uniformMotion(20, 10, 10));
    expect(totalTime(phases)).toBe(10);
    expect(stateAt(phases, 3)).toEqual({ t: 3, s: 50, v: 10, a: 0 });
    expect(displacement(phases, 10)).toBeCloseTo(100, 9);
    expect(pathLength(phases, 10)).toBeCloseTo(100, 9);
    // rückwärts: Ortsänderung negativ, Weg positiv
    const back = buildPhases(uniformMotion(50, -5, 10));
    expect(stateAt(back, 10).s).toBeCloseTo(0, 9);
    expect(displacement(back, 10)).toBeCloseTo(-50, 9);
    expect(pathLength(back, 10)).toBeCloseTo(50, 9);
  });

  it('beschreibt die gleichmäßig beschleunigte Bewegung aus dem Stand', () => {
    const phases = buildPhases(acceleratedMotion(0, 0, 2, 10));
    const st = stateAt(phases, 4);
    expect(st.s).toBeCloseTo(16, 9); // ½ · 2 · 4²
    expect(st.v).toBeCloseTo(8, 9); // 2 · 4
    expect(st.a).toBe(2);
    // Abstände in gleichen Zeitabständen verhalten sich wie 1 : 3 : 5 : 7
    const d = [1, 2, 3, 4].map((k) => stateAt(phases, k).s - stateAt(phases, k - 1).s);
    expect(d.map((x) => x / d[0]!)).toEqual([1, 3, 5, 7]);
  });

  it('bremst bis zum Stillstand und bleibt dann stehen', () => {
    const phases = buildPhases(acceleratedMotion(0, 20, -4, 8));
    expect(phases).toHaveLength(2);
    expect(phases[0]!.t1).toBeCloseTo(5, 9);
    expect(stateAt(phases, 5).s).toBeCloseTo(50, 9);
    expect(stateAt(phases, 8)).toMatchObject({ s: 50, v: 0, a: 0 });
    expect(brakingInfo(20, -4)).toEqual({ time: 5, distance: 50 });
    expect(brakingInfo(20, 2)).toBeNull();
    // Rückwärts fahrend bremst ein positives a
    expect(isBraking(-10, 2)).toBe(true);
    expect(isBraking(0, -2)).toBe(false);
    const reverse = buildPhases(acceleratedMotion(0, -10, 2, 10));
    expect(stateAt(reverse, 10)).toMatchObject({ s: -25, v: 0 });
    // Aus dem Stand mit a < 0: rückwärts anfahren
    expect(stateAt(buildPhases(acceleratedMotion(0, 0, -2, 3)), 3).s).toBeCloseTo(-9, 9);
  });

  it('setzt den Fahrplan aus Abschnitten zusammen (a = Δv/Δt)', () => {
    const motion = scheduleMotion(0, 0, [
      { v: 15, duration: 5 },
      { v: 15, duration: 10 },
      { v: 0, duration: 5 },
    ]);
    expect(motion.segments.map((s) => s.a)).toEqual([3, 0, -3]);
    const phases = buildPhases(motion);
    expect(totalTime(phases)).toBe(20);
    expect(stateAt(phases, 5).s).toBeCloseTo(37.5, 9);
    expect(stateAt(phases, 15).s).toBeCloseTo(187.5, 9);
    expect(stateAt(phases, 20)).toMatchObject({ v: 0 });
    expect(displacement(phases, 20)).toBeCloseTo(225, 9);
    expect(phaseIndexAt(phases, 0)).toBe(0);
    expect(phaseIndexAt(phases, 7)).toBe(1);
    expect(phaseIndexAt(phases, 99)).toBe(2);
  });

  it('unterscheidet Weg und Ortsänderung bei Richtungswechsel', () => {
    const phases = buildPhases(
      scheduleMotion(0, 0, [
        { v: 8, duration: 4 },
        { v: -8, duration: 8 },
        { v: 0, duration: 4 },
      ]),
    );
    expect(displacement(phases, 16)).toBeCloseTo(0, 9);
    expect(pathLength(phases, 16)).toBeCloseTo(64, 9);
    expect(extent(phases, 's')).toEqual([0, 32]);
    expect(extent(phases, 'v')).toEqual([-8, 8]);
    expect(extent(phases, 'a')).toEqual([-2, 2]);
  });

  it('hält den Zustand nach dem Ende und rechnet in km/h um', () => {
    const phases = buildPhases(uniformMotion(0, 10, 4));
    expect(stateAt(phases, 10).s).toBe(40);
    expect(stateAt(phases, -1).s).toBe(0);
    expect(toKmh(10)).toBeCloseTo(36, 9);
    expect(buildPhases({ s0: 0, v0: 0, segments: [{ duration: 0, a: 1 }] })).toHaveLength(0);
  });
});
