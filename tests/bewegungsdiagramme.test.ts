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

  it('liefert die Lösungen der Aufgaben im Lernmaterial', () => {
    // Aufgabe 1: 54 km/h = 15 m/s, in 8 s also 120 m
    expect(toKmh(15)).toBeCloseTo(54, 9);
    expect(displacement(buildPhases(uniformMotion(0, 15, 8)), 8)).toBeCloseTo(120, 9);
    // Aufgabe 2: s₀ = −50 m, v = 12,5 m/s → nach 12 s bei 100 m, s = 0 nach 4 s
    const a2 = buildPhases(uniformMotion(-50, 12.5, 12));
    expect(stateAt(a2, 12).s).toBeCloseTo(100, 9);
    expect(stateAt(a2, 4).s).toBeCloseTo(0, 9);
    // Aufgabe 3: a = 2,5 m/s² → nach 6 s 15 m/s und 45 m; 100 km/h nach ≈ 11,1 s
    const a3 = buildPhases(acceleratedMotion(0, 0, 2.5, 12));
    expect(stateAt(a3, 6).v).toBeCloseTo(15, 9);
    expect(stateAt(a3, 6).s).toBeCloseTo(45, 9);
    expect(100 / 3.6 / 2.5).toBeCloseTo(11.1, 1);
    // Aufgabe 4: Bremsweg 40 m nach 4 s, bei doppelter Geschwindigkeit 160 m (Regler-Obergrenze v₀ = 40 m/s)
    expect(brakingInfo(20, -5)).toEqual({ time: 4, distance: 40 });
    expect(brakingInfo(40, -5)).toEqual({ time: 8, distance: 160 });
    expect(stateAt(buildPhases(acceleratedMotion(0, 20, -5, 6)), 6)).toMatchObject({ s: 40, v: 0 });
    expect(stateAt(buildPhases(acceleratedMotion(0, 40, -5, 10)), 10)).toMatchObject({ s: 160, v: 0 });
    // Aufgabe 5: Durchschnittsgeschwindigkeit 225 m / 20 s
    const a5 = buildPhases(scheduleMotion(0, 0, [{ v: 15, duration: 5 }, { v: 15, duration: 10 }, { v: 0, duration: 5 }]));
    expect(displacement(a5, 20) / totalTime(a5)).toBeCloseTo(11.25, 9);
    // Aufgabe 6: im Umkehrpunkt t = 8 s ist v = 0, aber a = −2 m/s²
    const a6 = buildPhases(scheduleMotion(0, 0, [{ v: 8, duration: 4 }, { v: -8, duration: 8 }, { v: 0, duration: 4 }]));
    expect(stateAt(a6, 8).v).toBeCloseTo(0, 9);
    expect(stateAt(a6, 8).a).toBe(-2);
    expect(stateAt(a6, 8).s).toBeCloseTo(32, 9);
  });

  it('Steigung im t-s-Diagramm ist v, Fläche unter dem t-v-Graphen ist Δs', () => {
    const phases = buildPhases(acceleratedMotion(5, 3, 1.5, 10));
    for (const t of [1, 4.5, 9]) {
      const h = 1e-5;
      const slope = (stateAt(phases, t + h).s - stateAt(phases, t - h).s) / (2 * h);
      expect(slope).toBeCloseTo(stateAt(phases, t).v, 5);
      // Trapezfläche (v ist linear) = Ortsänderung
      const area = ((3 + stateAt(phases, t).v) / 2) * t;
      expect(displacement(phases, t)).toBeCloseTo(area, 9);
    }
  });

  it('behandelt Sonderfälle: Stillstand, a = 0, Bremsen über die ganze Dauer, Reglergrenzen', () => {
    // v = 0: Auto steht, keine Bremsangabe
    const still = buildPhases(uniformMotion(10, 0, 5));
    expect(stateAt(still, 5)).toMatchObject({ s: 10, v: 0 });
    expect(pathLength(still, 5)).toBe(0);
    expect(brakingInfo(0, -3)).toBeNull();
    // a = 0 im beschleunigten Modus = gleichförmig
    expect(stateAt(buildPhases(acceleratedMotion(0, 7, 0, 4)), 4).s).toBeCloseTo(28, 9);
    // Bremsen, das in der Dauer nicht zum Stillstand führt: v bleibt positiv
    const short = buildPhases(acceleratedMotion(0, 20, -2, 5));
    expect(short).toHaveLength(1);
    expect(stateAt(short, 5).v).toBeCloseTo(10, 9);
    // Grenzfall: Stillstand genau am Ende (v₀ = 20 m/s, a = −4 m/s², T = 5 s)
    const exact = buildPhases(acceleratedMotion(0, 20, -4, 5));
    expect(stateAt(exact, 5)).toMatchObject({ s: 50, v: 0 });
    // Reglergrenzen: v₀ = 40 m/s, a = −8 m/s² → 5 s, 100 m; v nie negativ
    const hard = buildPhases(acceleratedMotion(0, 40, -8, 30));
    expect(stateAt(hard, 30)).toMatchObject({ s: 100, v: 0, a: 0 });
    for (let t = 0; t <= 30; t += 0.5) expect(stateAt(hard, t).v).toBeGreaterThanOrEqual(-1e-12);
    // Rückwärts mit −20 m/s und a = +6 m/s² bremst ebenfalls bis zum Stillstand
    expect(brakingInfo(-20, 6)!.distance).toBeCloseTo(400 / 12, 9);
  });
});
