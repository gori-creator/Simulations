import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  bracket,
  buildTrack,
  customTrack,
  energiesAt,
  firstPass,
  G,
  goalOf,
  judgeRun,
  kineticEnergy,
  liftOffHeight,
  LOOP_RADIUS,
  loopMinHeight,
  loopMinSpeed,
  loopTopForces,
  loopTopSpeed,
  minStartHeight,
  normalAcceleration,
  placeStart,
  potentialEnergy,
  sampleAt,
  simulate,
  speedAtHeight,
  stepCart,
  type Track,
} from '../src/simulations/physik/energieerhaltung/model';

/** Energie pro kg an einem Fahrtzustand: g·h + ½v² + W_R/m. */
const perKg = (track: Track, st: { s: number; v: number; w: number }) => G * track.at(st.s).y + 0.5 * st.v * st.v + st.w;

describe('Modell: Energieerhaltung (Achterbahn) – Formeln', () => {
  it('h₀ = 20 m, m = 400 kg: E_pot = 78 480 J, unten v = 19,81 m/s, bei 10 m v = 14,01 m/s', () => {
    // E_pot = 400 · 9,81 · 20 = 78 480 J
    expect(potentialEnergy(400, 20)).toBeCloseTo(78480, 9);
    // v = √(2 · 9,81 · 20) = √392,4 = 19,809 m/s
    expect(speedAtHeight(20, 0)).toBeCloseTo(19.81, 2);
    // v = √(2 · 9,81 · 10) = √196,2 = 14,007 m/s
    expect(speedAtHeight(20, 10)).toBeCloseTo(14.01, 2);
    // unten ist die ganze Lageenergie Bewegungsenergie: ½ · 400 · 392,4 = 78 480 J
    expect(kineticEnergy(400, speedAtHeight(20, 0)!)).toBeCloseTo(78480, 6);
    // über der Starthöhe kommt der Wagen nicht an
    expect(speedAtHeight(20, 20.5)).toBeNull();
    expect(speedAtHeight(20, 20)).toBe(0);
  });

  it('v hängt nicht von der Masse ab, die Energien schon', () => {
    const track = buildTrack('tal');
    const s0 = track.startAt(15);
    const a = simulate(track, s0, 0, { tMax: 3 });
    // Bewegungsgleichung enthält m nicht: dieselbe Fahrt für jede Masse
    const st = sampleAt(a, 1.3);
    const light = energiesAt(track, st, 100);
    const heavy = energiesAt(track, st, 800);
    expect(heavy.kin / light.kin).toBeCloseTo(8, 9);
    expect(heavy.pot / light.pot).toBeCloseTo(8, 9);
    // v aus der Energie: ½mv² = E_kin ⇒ v = √(2·E_kin/m) – gleich für beide Massen
    expect(Math.sqrt((2 * light.kin) / 100)).toBeCloseTo(Math.sqrt((2 * heavy.kin) / 800), 12);
    // und gleich √(2g(h₀ − h))
    expect(Math.abs(st.v)).toBeCloseTo(speedAtHeight(track.at(s0).y, track.at(st.s).y)!, 2);
  });

  it('Looping r = 6 m: v_min = √(9,81 · 6) = 7,672 m/s, Mindesthöhe 2,5 · r = 15 m', () => {
    expect(loopMinSpeed(6)).toBeCloseTo(7.672, 3);
    expect(loopMinSpeed()).toBeCloseTo(Math.sqrt(G * LOOP_RADIUS), 12);
    expect(loopMinHeight(6)).toBe(15);
    // genau aus 15 m: oben v² = 2g(15 − 12) = g·r, die Schiene muss keine Kraft mehr aufbringen
    expect(loopTopSpeed(15)).toBeCloseTo(loopMinSpeed(), 12);
    expect(loopTopForces(400, 15)!.normal).toBeCloseTo(0, 9);
    // aus 20 m: v_oben = √(2 · 9,81 · 8) = 12,53 m/s; F_G = 3924 N, F_Z = 400 · 156,96 / 6 = 10 464 N
    const f = loopTopForces(400, 20)!;
    expect(loopTopSpeed(20)).toBeCloseTo(12.53, 2);
    expect(f.weight).toBeCloseTo(3924, 6);
    expect(f.centripetal).toBeCloseTo(10464, 6);
    expect(f.normal).toBeCloseTo(6540, 6);
    // unter 2r erreicht er den höchsten Punkt gar nicht
    expect(loopTopSpeed(11)).toBeNull();
  });

  it('Abhebehöhe im Looping h = (2h₀ + r)/3 (z. B. h₀ = 13 m → 10,67 m)', () => {
    expect(liftOffHeight(13)).toBeCloseTo(32 / 3, 12);
    expect(liftOffHeight(15)).toBeNull();
    expect(liftOffHeight(5)).toBeNull();
    // an der Grenze 2,5r läge die Abhebestelle genau oben (2r), bei h₀ = r auf Höhe des Mittelpunkts
    expect((2 * 14.999 + 6) / 3).toBeCloseTo(12, 2);
    expect(liftOffHeight(6.0001)).toBeCloseTo(6, 3);
  });
});

describe('Modell: Energieerhaltung (Achterbahn) – numerische Fahrt', () => {
  it.each(['tal', 'huegel', 'looping'] as const)('ohne Reibung bleibt E_pot + E_kin konstant (%s, Abweichung < 1e-3)', (id) => {
    const track = buildTrack(id);
    const run = simulate(track, track.startAt(22), 0, { tMax: 30 });
    const e0 = perKg(track, run.samples[0]!);
    let worst = 0;
    for (const st of run.samples) worst = Math.max(worst, Math.abs(perKg(track, st) - e0) / e0);
    expect(worst).toBeLessThan(1e-3);
    // ohne Reibung entsteht keine innere Energie
    expect(run.samples[run.samples.length - 1]!.w).toBe(0);
  });

  it('mit Reibung: E_pot + E_kin + W_R konstant, E_pot + E_kin fällt monoton, der Wagen bleibt stehen', () => {
    for (const id of ['tal', 'huegel', 'looping'] as const) {
      const track = buildTrack(id);
      const run = simulate(track, track.startAt(20), 0.03, { tMax: 120 });
      const e0 = perKg(track, run.samples[0]!);
      let prev = Infinity;
      for (const st of run.samples) {
        expect(Math.abs(perKg(track, st) - e0) / e0).toBeLessThan(1e-3);
        const mech = G * track.at(st.s).y + 0.5 * st.v * st.v;
        expect(mech).toBeLessThanOrEqual(prev + 1e-3);
        prev = mech;
      }
      expect(run.rest).toBe(true);
      expect(run.samples[run.samples.length - 1]!.w).toBeGreaterThan(1);
    }
  });

  it('ohne Reibung erreicht der Wagen auf der Tal-Bahn wieder genau die Starthöhe', () => {
    const track = buildTrack('tal');
    for (const h0 of [5, 15, 20]) {
      const s0 = track.startAt(h0);
      const run = simulate(track, s0, 0, { tMax: 12 });
      expect(run.turns.length).toBeGreaterThanOrEqual(2);
      // erster Umkehrpunkt gegenüber, zweiter wieder am Start – beide in h₀
      expect(run.turns[0]!.y).toBeCloseTo(h0, 2);
      expect(run.turns[1]!.y).toBeCloseTo(h0, 2);
      expect(track.at(run.turns[0]!.s).x).toBeCloseTo(-track.at(s0).x, 1);
    }
  });

  it('Looping: aus 20 m geschafft, aus 13 m fällt der Wagen in etwa (2h₀ + r)/3 heraus', () => {
    const make = (h0: number) => placeStart('looping', h0);
    const high = make(20);
    const okRun = simulate(high.track, high.s0, 0, { tMax: 20 });
    expect(goalOf(high.track)).toBe('loop');
    expect(judgeRun(high.track, okRun, 'loop')).toBe('ok');
    // oben (Höhe 2r) gilt v ≈ √(2g(h₀ − 2r))
    const top = firstPass(okRun, high.track.features.loopTop!)!;
    expect(Math.abs(top.v)).toBeCloseTo(loopTopSpeed(20)!, 1);
    expect(normalAcceleration(high.track, top.s, top.v, G)).toBeCloseTo(loopTopSpeed(20)! ** 2 / 6 - G, 0);
    const low = make(13);
    const failRun = simulate(low.track, low.s0, 0, { tMax: 20 });
    expect(judgeRun(low.track, failRun, 'loop')).toBe('fail');
    expect(failRun.liftOff).not.toBeNull();
    expect(failRun.liftOff!.y).toBeCloseTo(liftOffHeight(13)!, 1);
  });

  it('Bisektion findet die Mindesthöhe 2,5 · r = 15 m für den Looping (ohne Reibung)', () => {
    const h = minStartHeight((h0) => placeStart('looping', h0), 0, 'loop')!;
    expect(h).toBeGreaterThan(14.9);
    expect(h).toBeLessThan(15.1);
    // mit Reibung braucht man mehr
    const hf = minStartHeight((h0) => placeStart('looping', h0), 0.02, 'loop')!;
    expect(hf).toBeGreaterThan(h + 0.5);
  });

  it('eigene Bahn: ohne Reibung genau dann über den Hügel, wenn h₀ höher als der Hügel ist', () => {
    const custom = [20, 2, 14, 3, 10];
    const track = customTrack(custom);
    expect(track.crest!.y).toBeCloseTo(14, 6);
    expect(track.at(0).y).toBeCloseTo(20, 9);
    const h = minStartHeight((h0) => placeStart('eigen', h0, custom), 0, 'hill')!;
    // Grenzfall genau 14 m: der Wagen käme oben mit v = 0 an
    expect(h).toBeGreaterThan(13.95);
    expect(h).toBeLessThan(14.1);
    // zu niedrig: Umkehrpunkt vor dem Hügel genau in Starthöhe
    const low = placeStart('eigen', 12, custom);
    const run = simulate(low.track, low.s0, 0, { tMax: 10 });
    expect(judgeRun(low.track, run, 'hill')).toBe('fail');
    expect(run.turns[0]!.y).toBeCloseTo(12, 2);
    // der Hügel des Hügel-Parcours liegt bei etwa 11 m
    expect(buildTrack('huegel').crest!.y).toBeGreaterThan(10);
    expect(goalOf(buildTrack('tal'))).toBeNull();
  });

  it('Messreihe: Grenze eingegrenzt, sobald Erfolg und Misserfolg ≤ 0,5 m auseinander liegen', () => {
    expect(bracket([{ h0: 20, ok: true }])).toBeNull();
    expect(bracket([{ h0: 12, ok: false }, { h0: 20, ok: true }])).toBeNull();
    expect(bracket([{ h0: 14.5, ok: false }, { h0: 15, ok: true }, { h0: 20, ok: true }])).toEqual({ lo: 14.5, hi: 15 });
  });

  it('Plausibilität: zufällige eigene Bahnen erhalten die Energie (ohne und mit Reibung)', () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 25; i++) {
      const heights = [8 + rand() * 18, rand() * 6, rand() * 20, rand() * 10, rand() * 20];
      const mu = i % 2 ? 0 : rand() * 0.06;
      const { track, s0 } = placeStart('eigen', heights[0]!, heights);
      const run = simulate(track, s0, mu, { tMax: 20 });
      const e0 = perKg(track, run.samples[0]!);
      for (const st of run.samples) {
        expect(Math.abs(perKg(track, st) - e0) / e0).toBeLessThan(2e-3);
        // nie höher als der Start
        expect(track.at(st.s).y).toBeLessThanOrEqual(heights[0]! + 0.02);
      }
    }
  });
});

describe('Modell: Energieerhaltung (Achterbahn) – Aufgaben, Sonderfälle, Reglergrenzen', () => {
  it('Aufgabenwerte aus dem Lernmaterial', () => {
    // A1: v = √(2 · 9,81 · 15) = √294,3 = 17,155 m/s ≈ 17,2 m/s ≈ 62 km/h
    expect(speedAtHeight(15, 0)!).toBeCloseTo(17.155, 3);
    expect(Math.round(speedAtHeight(15, 0)! * 3.6)).toBe(62);
    // A2: E_pot = 78 480 J, in 10 m je die Hälfte (39 240 J), v = 14,0 m/s
    expect(potentialEnergy(400, 10)).toBeCloseTo(39240, 9);
    expect(kineticEnergy(400, speedAtHeight(20, 10)!)).toBeCloseTo(39240, 6);
    // A3: v_oben = 7,67 m/s; aus 14 m Abheben in (28 + 6)/3 = 11,33 m; aus 16 m oben √(2 · 9,81 · 4) = 8,86 m/s
    expect(liftOffHeight(14)).toBeCloseTo(11.333, 3);
    expect(loopTopSpeed(16)).toBeCloseTo(8.859, 3);
    // A5: Tal aus 15 m mit μ = 0,02: Umkehr bei ≈ 13,4 m, W_R ≈ 6,2 kJ, Summe 58,9 kJ
    const tal = buildTrack('tal');
    const run = simulate(tal, tal.startAt(15), 0.02, { tMax: 12 });
    const turn = run.turns[0]!;
    expect(turn.y).toBeGreaterThan(13.3);
    expect(turn.y).toBeLessThan(13.5);
    const at = sampleAt(run, turn.t);
    const e = energiesAt(tal, at, 400);
    expect(e.heat / 1000).toBeCloseTo(6.2, 1);
    expect(e.total / 1000).toBeCloseTo(58.86, 1);
    // A5 (Zusatz): Looping mit μ = 0,02 braucht etwa 17 m
    const hf = minStartHeight((h0) => placeStart('looping', h0), 0.02, 'loop')!;
    expect(hf).toBeGreaterThan(16.5);
    expect(hf).toBeLessThan(17.5);
  });

  it('größte Reibung μ = 0,06: der Wagen kommt auf jeder Bahn endgültig zur Ruhe (kein „Zittern“)', () => {
    for (const [id, h0] of [['huegel', 2], ['huegel', 20], ['tal', 2], ['tal', 26], ['looping', 26]] as const) {
      const { track, s0 } = placeStart(id, h0);
      const run = simulate(track, s0, 0.06, { tMax: 90 });
      expect(run.rest).toBe(true);
      // am Ende ist alle Energie (bis auf die Lage im Tal) Reibungswärme
      const last = run.samples[run.samples.length - 1]!;
      expect(last.v).toBe(0);
      const e0 = perKg(track, run.samples[0]!);
      expect(Math.abs(perKg(track, last) - e0) / e0).toBeLessThan(1e-3);
      // der Stillstand zählt nur einmal als Umkehrpunkt
      const tail = run.turns.filter((q) => q.t > run.end - 0.5);
      expect(tail.length).toBeLessThanOrEqual(1);
    }
  });

  it('Sonderfälle: Start auf Höhe 0, Start bergauf, Starthöhe über der Bahn', () => {
    // Start in Höhe 0: keine Geschwindigkeit, keine Energie
    expect(speedAtHeight(0, 0)).toBe(0);
    expect(potentialEnergy(400, 0)).toBe(0);
    // eigene Bahn, die am Start ansteigt (h₀ = 2 m, Punkt 1 in 26 m): der Wagen bleibt am Prellbock
    // stehen, ohne dass Energie entsteht
    const { track, s0 } = placeStart('eigen', 2, [2, 26, 14, 3, 10]);
    const run = simulate(track, s0, 0, { tMax: 5 });
    expect(run.samples.every((q) => q.v === 0 && q.s === 0 && q.w === 0)).toBe(true);
    expect(stepCart(track, { s: 0, v: 0, w: 0 }, G, 0, 0.002)).toEqual({ s: 0, v: 0, w: 0 });
    // Reglergrenze h₀ = 26 m: Looping-Bahn ist 27,5 m hoch, die Starthöhe wird übernommen
    expect(placeStart('looping', 26).h).toBeCloseTo(26, 6);
    expect(placeStart('tal', 26).h).toBeCloseTo(26, 6);
    // kleinste Starthöhe 2 m auf dem Hügel-Parcours: kommt nicht über den Hügel (≈ 11 m)
    const low = placeStart('huegel', 2);
    expect(judgeRun(low.track, simulate(low.track, low.s0, 0, { tMax: 10 }), 'hill')).toBe('fail');
    // ohne Reibung genügt für den Hügel knapp mehr als seine Höhe
    const hHill = minStartHeight((h0) => placeStart('huegel', h0), 0, 'hill')!;
    expect(hHill).toBeCloseTo(buildTrack('huegel').crest!.y, 1);
  });

  it('Masse 100 kg und 800 kg (Reglergrenzen): gleiche Fahrt, Energien im Verhältnis 1 : 8', () => {
    expect(potentialEnergy(800, 26) / potentialEnergy(100, 26)).toBeCloseTo(8, 12);
    // h₀ = 26 m, m = 800 kg: E_pot = 800 · 9,81 · 26 = 204 048 J
    expect(potentialEnergy(800, 26)).toBeCloseTo(204048, 6);
  });
});
