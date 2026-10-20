import { describe, expect, it } from 'vitest';
import {
  ammeterSlots,
  burnsOut,
  filamentTemperature,
  glowOf,
  LAMP_P,
  LAMP_R,
  NOMINAL_T,
  parallelR,
  partCount,
  seriesR,
  slotCurrent,
  solve,
} from '../src/simulations/physik/reihe-parallel/model';

const lamps = (n: number) => Array.from({ length: n }, () => LAMP_R);

describe('Modell: Reihen- und Parallelschaltung', () => {
  it('berechnet Ersatzwiderstände', () => {
    expect(seriesR([20, 30, 60])).toBe(110);
    expect(parallelR([20, 30, 60])).toBeCloseTo(10, 12);
    expect(parallelR([12, 12])).toBeCloseTo(6, 12);
    expect(parallelR([20, Infinity])).toBeCloseTo(20, 12);
    expect(parallelR([Infinity, Infinity])).toBe(Infinity);
    expect(partCount('mixed', 2)).toBe(3);
    expect(partCount('series', 3)).toBe(3);
  });

  it('teilt in der Reihenschaltung die Spannung auf, die Stromstärke ist überall gleich', () => {
    const two = solve('series', 6, lamps(2));
    expect(two.R).toBeCloseTo(24, 12);
    expect(two.I).toBeCloseTo(0.25, 12);
    for (const q of two.parts) {
      expect(q.I).toBeCloseTo(two.I, 12);
      expect(q.U).toBeCloseTo(3, 12);
    }
    const res = solve('series', 6, [20, 30, 60]);
    expect(res.R).toBeCloseTo(110, 12);
    const sumU = res.parts.reduce((s, q) => s + q.U, 0);
    expect(sumU).toBeCloseTo(6, 12);
    // Spannungen im Verhältnis der Widerstände
    expect(res.parts[2]!.U / res.parts[0]!.U).toBeCloseTo(3, 12);
  });

  it('legt in der Parallelschaltung an jeden Zweig die volle Spannung, die Ströme addieren sich', () => {
    const two = solve('parallel', 6, lamps(2));
    expect(two.R).toBeCloseTo(6, 12);
    expect(two.I).toBeCloseTo(1, 12);
    for (const q of two.parts) {
      expect(q.U).toBeCloseTo(6, 12);
      expect(q.I).toBeCloseTo(0.5, 12);
    }
    const res = solve('parallel', 6, [20, 30, 60]);
    expect(res.R).toBeCloseTo(10, 12);
    expect(res.parts.map((q) => q.I)).toEqual([0.3, 0.2, 0.1].map((v) => expect.closeTo(v, 12)));
    expect(res.parts.reduce((s, q) => s + q.I, 0)).toBeCloseTo(res.I, 12);
  });

  it('berechnet die gemischte Schaltung', () => {
    const res = solve('mixed', 6, [20, 30, 60]);
    expect(res.R).toBeCloseTo(40, 12);
    expect(res.I).toBeCloseTo(0.15, 12);
    expect(res.parts[0]!.U).toBeCloseTo(3, 12);
    expect(res.parts[1]!.U).toBeCloseTo(3, 12);
    expect(res.parts[2]!.U).toBeCloseTo(3, 12);
    expect(res.parts[1]!.I + res.parts[2]!.I).toBeCloseTo(res.parts[0]!.I, 12);
    const l = solve('mixed', 6, lamps(3));
    expect(l.parts[0]!.U).toBeCloseTo(4, 12);
    expect(l.parts[1]!.U).toBeCloseTo(2, 12);
  });

  it('unterbricht beim Herausdrehen den passenden Teil der Schaltung', () => {
    // Reihe: alles aus, an der leeren Fassung liegt die volle Spannung
    const s = solve('series', 6, lamps(3), [false, true, false]);
    expect(s.I).toBe(0);
    expect(s.R).toBe(Infinity);
    expect(s.parts[1]!.U).toBe(6);
    expect(s.parts[0]!.U).toBe(0);
    // zwei Unterbrechungen: an keiner einzelnen liegt eine bestimmte Spannung
    expect(solve('series', 6, lamps(3), [true, true, false]).parts.every((q) => q.U === 0)).toBe(true);
    // parallel: die anderen Zweige bleiben unverändert
    const before = solve('parallel', 6, lamps(3));
    const after = solve('parallel', 6, lamps(3), [false, true, false]);
    expect(after.parts[0]!.I).toBeCloseTo(before.parts[0]!.I, 12);
    expect(after.parts[1]!.I).toBe(0);
    expect(after.I).toBeCloseTo(before.I - before.parts[1]!.I, 12);
    // gemischt: Lampe 3 heraus → Lampe 1 und 2 in Reihe (je 3 V): Lampe 1 dunkler, Lampe 2 heller
    const mixed = solve('mixed', 6, lamps(3), [false, false, true]);
    expect(mixed.parts[0]!.U).toBeCloseTo(3, 12);
    expect(mixed.parts[1]!.U).toBeCloseTo(3, 12);
    expect(mixed.parts[2]!.I).toBe(0);
    // gemischt: Lampe 1 heraus → kein Strom
    const off = solve('mixed', 6, lamps(3), [true, false, false]);
    expect(off.I).toBe(0);
    expect(off.parts[0]!.U).toBe(6);
  });

  it('kennt die Messstellen der Strommesser', () => {
    expect(ammeterSlots('series', 2)).toHaveLength(3);
    expect(ammeterSlots('series', 3)).toHaveLength(4);
    expect(ammeterSlots('parallel', 2)).toHaveLength(4);
    expect(ammeterSlots('parallel', 3)).toHaveLength(5);
    expect(ammeterSlots('mixed', 2)).toHaveLength(5);
    const res = solve('parallel', 6, [20, 30]);
    const slots = ammeterSlots('parallel', 2);
    expect(slotCurrent(slots[0]!, res)).toBeCloseTo(0.5, 12);
    expect(slotCurrent(slots[1]!, res)).toBeCloseTo(0.3, 12);
    expect(slotCurrent(slots[2]!, res)).toBeCloseTo(0.2, 12);
    expect(slotCurrent(slots[3]!, res)).toBeCloseTo(0.5, 12);
  });

  it('lässt die Lampen passend hell leuchten und bei Überspannung durchbrennen', () => {
    expect(filamentTemperature(LAMP_P)).toBeCloseTo(NOMINAL_T, 9);
    const series = solve('series', 6, lamps(2));
    const parallel = solve('parallel', 6, lamps(2));
    const gs = glowOf(filamentTemperature(series.parts[0]!.P));
    const gp = glowOf(filamentTemperature(parallel.parts[0]!.P));
    expect(gs).toBeGreaterThan(0.1);
    expect(gs).toBeLessThan(gp / 2);
    // drei Lampen in Reihe glühen nur noch schwach
    expect(glowOf(filamentTemperature(solve('series', 6, lamps(3)).parts[0]!.P))).toBeLessThan(gs);
    // zwei 6-V-Lampen in Reihe an 12 V: normal hell, keine Überlastung
    const twelve = solve('series', 12, lamps(2));
    expect(twelve.parts[0]!.U).toBeCloseTo(6, 12);
    expect(burnsOut(twelve.parts[0]!.U)).toBe(false);
    expect(burnsOut(solve('parallel', 12, lamps(2)).parts[0]!.U)).toBe(true);
    expect(burnsOut(9)).toBe(false);
  });

  it('löst die Aufgaben des Lernmaterials (Prüfrunde)', () => {
    // A1: 12 Ω + 12 Ω = 24 Ω, I = 6 V / 24 Ω = 0,25 A, je 3 V
    const a1 = solve('series', 6, lamps(2));
    expect(a1.R).toBeCloseTo(24, 12);
    expect(a1.parts.map((q) => q.U)).toEqual([3, 3].map((v) => expect.closeTo(v, 12)));
    // A2: drei Lampen parallel: je 0,5 A, zusammen 1,5 A, R = 4 Ω
    const a2 = solve('parallel', 6, lamps(3));
    expect(a2.I).toBeCloseTo(1.5, 12);
    expect(a2.R).toBeCloseTo(4, 12);
    // A3: 20 Ω ∥ 30 Ω an 6 V: 0,3 A + 0,2 A = 0,5 A, R = 12 Ω
    const a3 = solve('parallel', 6, [20, 30]);
    expect(a3.I).toBeCloseTo(0.5, 12);
    expect(a3.R).toBeCloseTo(12, 12);
    // A4: 12 Ω + 6 Ω = 18 Ω, I = 1/3 A, U₁ = 4 V, U₂ = U₃ = 2 V; Lampe 1 am hellsten
    const a4 = solve('mixed', 6, lamps(3));
    expect(a4.R).toBeCloseTo(18, 12);
    expect(a4.I).toBeCloseTo(1 / 3, 12);
    expect(a4.parts.map((q) => q.U)).toEqual([4, 2, 2].map((v) => expect.closeTo(v, 12)));
    expect(a4.parts[0]!.P).toBeGreaterThan(a4.parts[1]!.P);
    // A5: an 12 V in Reihe je 6 V (Nennleistung 3 W), parallel je 12 V → durchgebrannt
    expect(solve('series', 12, lamps(2)).parts[0]!.P).toBeCloseTo(LAMP_P, 12);
    expect(burnsOut(solve('parallel', 12, lamps(3)).parts[2]!.U)).toBe(true);
  });

  it('erfüllt Spannungs- und Stromteiler und behandelt Sonderfälle (Prüfrunde)', () => {
    // Spannungsteiler: U₁/U₂ = R₁/R₂
    const s = solve('series', 10, [40, 60]);
    expect(s.parts[0]!.U).toBeCloseTo(4, 12);
    expect(s.parts[1]!.U).toBeCloseTo(6, 12);
    // Stromteiler: I₁/I₂ = R₂/R₁
    const p = solve('parallel', 12, [40, 60]);
    expect(p.parts[0]!.I / p.parts[1]!.I).toBeCloseTo(60 / 40, 12);
    expect(p.R).toBeCloseTo(24, 12);
    // gleiche Widerstände: n gleiche → R/n parallel, n·R in Reihe
    expect(solve('parallel', 6, [30, 30, 30]).R).toBeCloseTo(10, 12);
    expect(solve('series', 6, [30, 30, 30]).R).toBeCloseTo(90, 12);
    // gemischt mit R₁ = 200 Ω, R₂ = R₃ = 5 Ω: R = 202,5 Ω
    const m = solve('mixed', 6, [200, 5, 5]);
    expect(m.R).toBeCloseTo(202.5, 12);
    expect(m.parts[1]!.I).toBeCloseTo(6 / 202.5 / 2, 12);
    // parallel: herausgedrehte Lampe ändert Helligkeit der anderen nicht
    const before = solve('parallel', 6, lamps(2));
    const after = solve('parallel', 6, lamps(2), [true, false]);
    expect(after.parts[1]!.P).toBeCloseTo(before.parts[1]!.P, 12);
    // alle Zweige offen: kein Strom, R unendlich, Fassungen haben volle Spannung
    const none = solve('parallel', 6, lamps(2), [true, true]);
    expect(none.I).toBe(0);
    expect(none.R).toBe(Infinity);
    expect(none.parts[0]!.U).toBe(6);
    // gemischt: Lampe 2 heraus → Lampe 1 und 3 in Reihe, je 3 V
    const m2 = solve('mixed', 6, lamps(3), [false, true, false]);
    expect(m2.parts[2]!.U).toBeCloseTo(3, 12);
    expect(m2.parts[1]!.I).toBe(0);
    // gemischt: Lampe 2 und 3 heraus → Kreis offen, an der Unterbrechung 6 V
    const m3 = solve('mixed', 6, lamps(3), [false, true, true]);
    expect(m3.I).toBe(0);
    expect(m3.parts[1]!.U).toBe(6);
    // kalte Lampe leuchtet nicht, Grenze für Durchbrennen 9 V
    expect(glowOf(filamentTemperature(0))).toBe(0);
    expect(burnsOut(9.01)).toBe(true);
  });
});
