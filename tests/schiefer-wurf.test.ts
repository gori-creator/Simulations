import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  aimAngles,
  dragConstant,
  dragFlight,
  footballDrag,
  heightAt,
  judgeShot,
  maxRange,
  minSpeed,
  optimalAngle,
  optimalAngleWith,
  PLANETS,
  randomTarget,
  rangeWith,
  sampleAt,
  specificEnergy,
  strobeInterval,
  targetRadius,
  vacuumFlight,
  vacuumRange,
  vacuumState,
  type Launch,
} from '../src/simulations/physik/schiefer-wurf/model';

const G = 9.81;

describe('Modell: Waagerechter und schiefer Wurf', () => {
  it('schiefer Wurf vom Boden: v₀ = 15 m/s, α = 30°', () => {
    const f = vacuumFlight({ v0: 15, angle: 30, h0: 0, g: G });
    // T = 2·15·sin 30° / 9,81 = 1,529 s
    expect(f.time).toBeCloseTo((2 * 15 * 0.5) / G, 10);
    expect(f.time).toBeCloseTo(1.529, 3);
    // w = v₀²·sin(2α)/g = 225 · 0,8660 / 9,81 = 19,86 m
    expect(f.range).toBeCloseTo(19.86, 2);
    // h_max = (15·0,5)² / (2·9,81) = 2,867 m, erreicht nach T/2
    expect(f.maxHeight).toBeCloseTo(2.867, 3);
    expect(f.apexTime).toBeCloseTo(f.time / 2, 12);
    // Am Scheitel ist v_y = 0, vₓ bleibt v₀·cos α
    const apex = vacuumState({ v0: 15, angle: 30, h0: 0, g: G }, f.apexTime);
    expect(apex.vy).toBeCloseTo(0, 12);
    expect(apex.vx).toBeCloseTo(15 * Math.cos(Math.PI / 6), 12);
  });

  it('waagerechter Wurf: v₀ = 10 m/s aus h₀ = 20 m', () => {
    const f = vacuumFlight({ v0: 10, angle: 0, h0: 20, g: G });
    // t = √(2·20/9,81) = 2,019 s – wie beim freien Fall
    expect(f.time).toBeCloseTo(Math.sqrt(40 / G), 12);
    expect(f.time).toBeCloseTo(2.019, 3);
    expect(f.range).toBeCloseTo(20.19, 2);
    // Aufprallgeschwindigkeit √(10² + (9,81·2,019)²) = √(100 + 392,4) = 22,19 m/s
    // (gleich √(v₀² + 2·g·h₀) nach dem Energiesatz)
    expect(Math.hypot(f.impact.vx, f.impact.vy)).toBeCloseTo(22.19, 2);
    expect(Math.hypot(f.impact.vx, f.impact.vy)).toBeCloseTo(Math.sqrt(100 + 2 * G * 20), 10);
    expect(f.maxHeight).toBe(20);
  });

  it('Komplementärwinkel ergeben dieselbe Weite, Maximum bei 45°', () => {
    expect(vacuumRange(15, 30, 0, G)).toBeCloseTo(vacuumRange(15, 60, 0, G), 10);
    expect(vacuumRange(15, 15, 0, G)).toBeCloseTo(vacuumRange(15, 75, 0, G), 10);
    // w_max = 15² / 9,81 = 22,94 m
    expect(vacuumRange(15, 45, 0, G)).toBeCloseTo(22.94, 2);
    expect(maxRange(15, 0, G)).toBeCloseTo(22.94, 2);
    expect(optimalAngle(15, 0, G)).toBeCloseTo(45, 10);
    for (let a = 0; a <= 90; a += 1) expect(vacuumRange(15, a, 0, G)).toBeLessThanOrEqual(maxRange(15, 0, G) + 1e-9);
  });

  it('aus der Höhe ist der beste Winkel kleiner als 45°', () => {
    const best = optimalAngle(10, 20, G);
    expect(best).toBeLessThan(45);
    // tan α = v₀ / √(v₀² + 2gh₀) = 10 / √(100 + 392,4)
    expect(Math.tan((best * Math.PI) / 180)).toBeCloseTo(10 / Math.sqrt(100 + 2 * G * 20), 12);
    const w = maxRange(10, 20, G);
    expect(vacuumRange(10, best, 20, G)).toBeCloseTo(w, 9);
    for (let a = -45; a <= 90; a += 0.5) expect(vacuumRange(10, a, 20, G)).toBeLessThanOrEqual(w + 1e-9);
  });

  it('auf dem Mond (g = 1,62 m/s²) fliegt der Ball 6-mal so weit', () => {
    // w = 225 · sin 60° / 1,62 = 120,3 m
    expect(vacuumRange(15, 30, 0, PLANETS.mond.g)).toBeCloseTo(120.3, 1);
    expect(vacuumRange(15, 30, 0, PLANETS.mond.g) / vacuumRange(15, 30, 0, G)).toBeCloseTo(9.81 / 1.62, 10);
  });

  it('Bahngleichung: y(x) = h₀ + tan α · x − g·x² / (2v₀²·cos²α)', () => {
    const launch: Launch = { v0: 12, angle: 40, h0: 3, g: G };
    const a = (40 * Math.PI) / 180;
    for (const x of [0, 2.5, 7, 13]) {
      expect(heightAt(launch, x)).toBeCloseTo(3 + Math.tan(a) * x - (G * x * x) / (2 * 144 * Math.cos(a) ** 2), 10);
    }
    expect(heightAt({ v0: 12, angle: 90, h0: 3, g: G }, 1)).toBeNull();
  });

  it('Zielwurf: Ziel auf Abwurfhöhe in 19,86 m bei v₀ = 15 m/s → 30° und 60°', () => {
    const w = vacuumRange(15, 30, 0, G);
    const sol = aimAngles(15, w, 0, G);
    expect(sol).toHaveLength(2);
    expect(sol[0]).toBeCloseTo(30, 9);
    expect(sol[1]).toBeCloseTo(60, 9);
    // auf 19,86 m gerundet: fast dieselben Winkel
    const near = aimAngles(15, 19.86, 0, G);
    expect(near[0]).toBeCloseTo(30, 1);
    expect(near[1]).toBeCloseTo(60, 1);
    // genau auf der Grenze (größte Weite) nur ein Winkel, dahinter keiner
    expect(aimAngles(15, maxRange(15, 0, G), 0, G)).toHaveLength(1);
    expect(aimAngles(15, 23, 0, G)).toEqual([]);
    // kleinste nötige Geschwindigkeit
    expect(minSpeed(w, 0, G)).toBeCloseTo(Math.sqrt(G * w), 12);
    expect(aimAngles(minSpeed(20, 5, G) - 0.01, 20, 5, G)).toEqual([]);
    expect(aimAngles(minSpeed(20, 5, G) + 0.01, 20, 5, G).length).toBeGreaterThan(0);
  });

  it('Lösungswinkel treffen das Ziel tatsächlich (auch über und unter der Abwurfhöhe)', () => {
    const rand = seededRandom(11);
    for (let i = 0; i < 200; i++) {
      const v0 = 5 + rand() * 30;
      const h0 = rand() * 20;
      const dx = 2 + rand() * 40;
      const dy = -h0 + rand() * 25;
      for (const a of aimAngles(v0, dx, dy, G)) {
        expect(heightAt({ v0, angle: a, h0, g: G }, dx)).toBeCloseTo(h0 + dy, 6);
      }
    }
  });

  it('Auswertung des Zielwurfs: Treffer, zu kurz, zu weit', () => {
    const launch: Launch = { v0: 15, angle: 30, h0: 0, g: G };
    const f = vacuumFlight(launch);
    const at = (t: number) => vacuumState(launch, t);
    const y10 = heightAt(launch, 10)!;
    expect(judgeShot(at, f.time, 10, y10).result).toBe('hit');
    expect(judgeShot(at, f.time, 10, y10 + 2).result).toBe('short');
    expect(judgeShot(at, f.time, 10, y10 - 2).result).toBe('long');
    expect(judgeShot(at, f.time, 25, 1).result).toBe('short');
    expect(judgeShot(at, f.time, 10, y10).t).toBeCloseTo(10 / (15 * Math.cos(Math.PI / 6)), 9);
    expect(targetRadius(20)).toBeCloseTo(0.8, 12);
  });

  it('zufällige Ziele sind mit Reglerwerten lösbar', () => {
    const rand = seededRandom(5);
    for (const planet of ['erde', 'mond', 'mars'] as const) {
      const g = PLANETS[planet].g;
      for (let i = 0; i < 60; i++) {
        const h0 = [0, 1.5, 10][i % 3]!;
        const q = randomTarget(rand, g, h0);
        expect(q.tx).toBeGreaterThanOrEqual(4);
        expect(q.tx).toBeLessThanOrEqual(150);
        expect(Number.isInteger(q.angle)).toBe(true);
        expect(Number.isInteger(q.v0 * 2)).toBe(true);
        const launch: Launch = { v0: q.v0, angle: q.angle, h0, g };
        expect(judgeShot((t) => vacuumState(launch, t), vacuumFlight(launch).time, q.tx, q.ty).result).toBe('hit');
        expect(minSpeed(q.tx, q.ty - h0, g)).toBeLessThanOrEqual(q.v0 + 0.5);
      }
    }
  });

  it('Sonderfälle: senkrechter Wurf, Wurf nach unten, kein Flug vom Boden', () => {
    const up = vacuumFlight({ v0: 10, angle: 90, h0: 0, g: G });
    expect(up.range).toBe(0);
    expect(up.maxHeight).toBeCloseTo(100 / (2 * G), 12);
    const down = vacuumFlight({ v0: 10, angle: -30, h0: 20, g: G });
    expect(down.apexTime).toBe(0);
    expect(down.maxHeight).toBe(20);
    expect(down.time).toBeLessThan(vacuumFlight({ v0: 10, angle: 0, h0: 20, g: G }).time);
    expect(vacuumFlight({ v0: 10, angle: -20, h0: 0, g: G }).time).toBe(0);
    expect(dragFlight({ v0: 10, angle: -20, h0: 0, g: G }, 0.01).flight.time).toBe(0);
    expect(dragFlight({ v0: 10, angle: 0, h0: 0, g: G }, 0.01).flight.range).toBe(0);
  });

  it('Luftwiderstand: Beiwerte der Wurfkörper', () => {
    // k = ρ·c_w·A/(2m) = 1,2 · 0,25 · π·0,11² / 0,86 ≈ 0,0133 1/m
    expect(footballDrag(1.2)).toBeCloseTo((1.2 * 0.25 * Math.PI * 0.0121) / 0.86, 12);
    expect(footballDrag(1.2)).toBeCloseTo(0.0133, 4);
    expect(dragConstant(1.2, 'tt')).toBeGreaterThan(footballDrag(1.2));
    expect(dragConstant(1.2, 'kugel')).toBeLessThan(footballDrag(1.2));
    expect(dragConstant(0, 'tt')).toBe(0);
  });

  it('ohne Luft stimmt die numerische Bahn mit der Formel überein', () => {
    const launch: Launch = { v0: 18, angle: 52, h0: 4, g: G };
    const res = dragFlight(launch, 0);
    const exact = vacuumFlight(launch);
    expect(res.flight.time).toBeCloseTo(exact.time, 4);
    expect(res.flight.range).toBeCloseTo(exact.range, 3);
    expect(res.flight.maxHeight).toBeCloseTo(exact.maxHeight, 4);
    const s = sampleAt(res.samples, 1.234);
    expect(s.x).toBeCloseTo(vacuumState(launch, 1.234).x, 6);
    expect(s.y).toBeCloseTo(vacuumState(launch, 1.234).y, 6);
    // ohne Luft bleibt die Energie erhalten
    for (const q of res.samples.filter((_, i) => i % 200 === 0)) expect(specificEnergy(q, G)).toBeCloseTo(specificEnergy(res.samples[0]!, G), 6);
  });

  it('mit Luftwiderstand: kürzere Weite, Energie nimmt ab (viele Zufallswerte)', () => {
    const rand = seededRandom(3);
    for (let i = 0; i < 40; i++) {
      const launch: Launch = { v0: 5 + rand() * 35, angle: 5 + rand() * 80, h0: rand() * 20, g: G };
      const k = dragConstant(1.2, (['fb', 'tt', 'kugel'] as const)[i % 3]!);
      const res = dragFlight(launch, k, 0.005);
      const vac = vacuumFlight(launch);
      expect(res.flight.range).toBeLessThan(vac.range);
      expect(res.flight.maxHeight).toBeLessThanOrEqual(vac.maxHeight + 1e-9);
      let last = Infinity;
      for (const q of res.samples) {
        const e = specificEnergy(q, G);
        expect(e).toBeLessThanOrEqual(last + 1e-9);
        last = e;
      }
    }
  });

  it('mit Luftwiderstand ist der beste Winkel kleiner als 45°', () => {
    const k = footballDrag(1.2);
    const best = optimalAngleWith(28, 0, G, k);
    expect(best.angle).toBeLessThan(45);
    expect(best.angle).toBeGreaterThan(25);
    expect(best.range).toBeLessThan(maxRange(28, 0, G));
    for (const a of [20, 30, 45, 55]) expect(rangeWith({ v0: 28, angle: a, h0: 0, g: G }, k)).toBeLessThanOrEqual(best.range + 0.05);
    // ohne Luft liefert dieselbe Funktion 45°
    expect(optimalAngleWith(15, 0, G, 0).angle).toBeCloseTo(45, 10);
  });

  it('Stroboskop: höchstens etwa 30 Bilder', () => {
    expect(strobeInterval(1.5)).toBe(0.1);
    expect(strobeInterval(4)).toBe(0.2);
    expect(strobeInterval(40)).toBe(2);
  });
});
