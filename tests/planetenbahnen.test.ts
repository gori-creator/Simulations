import { describe, expect, it } from 'vitest';
import {
  AU,
  circularSpeed,
  conicPoint,
  energies,
  escapeSpeed,
  keplerConstant,
  keplerPeriod,
  keplerRatio,
  KMS,
  M_SUN,
  MU_SUN,
  orbitFromState,
  OrbitRun,
  planetPeriod,
  PLANETS,
  R_SUN,
  startState,
  timeFromPerihelion,
  trueAnomalyAt,
  trueAnomalyOf,
  YEAR,
} from '../src/simulations/physik/planetenbahnen/model';

describe('Modell: Planetenbahnen – Konstanten', () => {
  it('G·M☉ in AE³/a² ist fast genau 4π² (Erdbahn: T ≈ 1 a)', () => {
    expect(MU_SUN / (4 * Math.PI * Math.PI)).toBeCloseTo(1, 4);
    expect(keplerPeriod(1, 1) * 365.25).toBeCloseTo(365.24, 1);
  });

  it('Sonnenmasse, 1 AE/a in km/s und Sonnenradius', () => {
    expect(M_SUN / 1e30).toBeCloseTo(1.9884, 4);
    expect(KMS).toBeCloseTo(4.7405, 4);
    expect(R_SUN).toBeCloseTo(0.00465, 5);
  });

  it('Kreisbahn- und Fluchtgeschwindigkeit bei 1 AE: 29,78 km/s und 42,12 km/s', () => {
    expect(circularSpeed(1, 1)).toBeCloseTo(29.78, 2);
    expect(escapeSpeed(1, 1)).toBeCloseTo(42.12, 2);
    expect(escapeSpeed(2, 1) / circularSpeed(2, 1)).toBeCloseTo(Math.SQRT2, 12);
    // doppelte Zentralmasse: √2-fache Geschwindigkeit
    expect(circularSpeed(1, 2) / circularSpeed(1, 1)).toBeCloseTo(Math.SQRT2, 12);
  });

  it('Keplersche Konstante der Sonne T²/a³ = 4π²/(G·M) ≈ 2,97·10⁻¹⁹ s²/m³', () => {
    expect(keplerConstant(1) * 1e19).toBeCloseTo(2.9747, 3);
    expect(keplerConstant(2)).toBeCloseTo(keplerConstant(1) / 2, 30);
    expect(keplerRatio(1, 1) * 1e19).toBeCloseTo((YEAR * YEAR) / AU ** 3 * 1e19, 10);
  });
});

describe('Modell: Planetenbahnen – Bahnform', () => {
  it('v₀ = v_K senkrecht zum Fahrstrahl ergibt eine Kreisbahn', () => {
    const o = orbitFromState(startState(1, circularSpeed(1, 1), 90), 1);
    expect(o.kind).toBe('circle');
    expect(o.e).toBeLessThan(1e-9);
    expect(o.a).toBeCloseTo(1, 9);
    expect(o.T).toBeCloseTo(keplerPeriod(1, 1), 9);
  });

  it('Start im Perihel mit v₀ > v_K: Ellipse mit r_P = r₀, ε = (v₀/v_K)² − 1', () => {
    const v0 = 36;
    const o = orbitFromState(startState(1, v0, 90), 1);
    const q = v0 / circularSpeed(1, 1);
    expect(o.kind).toBe('ellipse');
    expect(o.rP).toBeCloseTo(1, 9);
    expect(o.e).toBeCloseTo(q * q - 1, 9);
    expect(o.a).toBeCloseTo((o.rP + o.rA) / 2, 9);
    expect(o.c).toBeCloseTo(o.a - o.rP, 9);
    expect(o.b).toBeCloseTo(Math.sqrt(o.a * o.a - o.c * o.c), 9);
    // Perihel liegt auf der +x-Achse, der zweite Brennpunkt bei −2c
    expect(o.omega).toBeCloseTo(0, 9);
    expect(o.focus2[0]).toBeCloseTo(-2 * o.c, 9);
    expect(o.vP).toBeCloseTo(v0, 9);
    // Drehimpuls: r_P · v_P = r_A · v_A
    expect(o.rP * o.vP).toBeCloseTo(o.rA * o.vA, 9);
  });

  it('Start im Aphel mit v₀ < v_K: r_A = r₀', () => {
    const o = orbitFromState(startState(1, 22, 90), 1);
    expect(o.kind).toBe('ellipse');
    expect(o.rA).toBeCloseTo(1, 9);
    expect(Math.cos(o.omega)).toBeCloseTo(-1, 9);
  });

  it('v₀ = v_F ergibt eine Parabel, darüber eine Hyperbel', () => {
    expect(orbitFromState(startState(1, escapeSpeed(1, 1), 90), 1).kind).toBe('parabola');
    const h = orbitFromState(startState(1, 46, 90), 1);
    expect(h.kind).toBe('hyperbola');
    expect(h.bound).toBe(false);
    expect(h.e).toBeGreaterThan(1);
    expect(h.T).toBe(Infinity);
    // Mittelpunkt der Hyperbel liegt im Abstand a·ε vom Brennpunkt
    expect(Math.hypot(...h.center)).toBeCloseTo(h.a * h.e, 9);
  });

  it('die Bahnpunkte erfüllen die Ellipsengleichung r₁ + r₂ = 2a', () => {
    const o = orbitFromState(startState(1.2, 30, 65), 1);
    expect(o.kind).toBe('ellipse');
    for (const nu of [0, 0.7, 1.9, 3.1, 4.4, 5.8]) {
      const [x, y] = conicPoint(o, nu);
      const r1 = Math.hypot(x, y);
      const r2 = Math.hypot(x - o.focus2[0], y - o.focus2[1]);
      expect(r1 + r2).toBeCloseTo(2 * o.a, 9);
    }
    // Startpunkt liegt auf der Bahn
    const nu0 = trueAnomalyAt(o, 1.2);
    expect(Number.isNaN(nu0)).toBe(false);
  });

  it('Kepler-Gleichung: Zeit vom Perihel bis zum Aphel ist T/2, numerisch bestätigt', () => {
    const o = orbitFromState(startState(1, 36, 90), 1);
    expect(timeFromPerihelion(o, Math.PI - 1e-9, 1)).toBeCloseTo(o.T / 2, 6);
    expect(timeFromPerihelion(o, -1, 1)).toBeCloseTo(-timeFromPerihelion(o, 1, 1), 12);
    // Hyperbel und Parabel: Ankunftszeit beim Abstand 3 AE mit der numerischen Bahn vergleichen
    for (const v0 of [escapeSpeed(1, 1), 46]) {
      const run = new OrbitRun({ r0: 1, v0, alpha: 90, M: 1, n: 12, closed: true });
      const nu = trueAnomalyAt(run.orbit, 3);
      const t = timeFromPerihelion(run.orbit, nu, 1);
      run.advance(t, 1e7);
      expect(run.r).toBeCloseTo(3, 2);
      expect(trueAnomalyOf(run.orbit, run.s.x, run.s.y)).toBeCloseTo(nu, 2);
    }
  });

  it('erkennt eine Bahn, die in den Stern führt', () => {
    const o = orbitFromState(startState(1, 2, 30), 1);
    expect(o.rP).toBeLessThan(R_SUN);
    expect(o.hitsStar).toBe(true);
    expect(orbitFromState(startState(1, 36, 90), 1).hitsStar).toBe(false);
  });
});

describe('Modell: Planetenbahnen – numerische Bahn', () => {
  it('die numerische Bahn läuft auf der Kepler-Ellipse und schließt sich nach T', () => {
    const run = new OrbitRun({ r0: 1, v0: 36, alpha: 90, M: 1, n: 12, closed: true });
    const o = run.orbit;
    run.advance(o.T * 1.05, 1e7);
    expect(run.lap).not.toBeNull();
    // gemessene Umlaufdauer und große Halbachse stimmen mit der Theorie überein
    expect(run.lap!.T / o.T).toBeCloseTo(1, 5);
    expect(run.lap!.a / o.a).toBeCloseTo(1, 5);
    expect(run.lap!.rMin).toBeCloseTo(o.rP, 5);
    expect(run.lap!.rMax).toBeCloseTo(o.rA, 4);
    // jeder Spurpunkt liegt (fast) auf der Ellipse
    for (const [x, y] of run.trail) {
      const r1 = Math.hypot(x, y);
      const r2 = Math.hypot(x - o.focus2[0], y - o.focus2[1]);
      expect(Math.abs(r1 + r2 - 2 * o.a) / o.a).toBeLessThan(1e-4);
    }
  });

  it('2. Keplersches Gesetz: gleiche Flächen in gleichen Zeiten, zusammen π·a·b', () => {
    const run = new OrbitRun({ r0: 1, v0: 36, alpha: 90, M: 1, n: 12, closed: true });
    run.advance(run.orbit.T * 1.02, 1e7);
    const done = run.sectors.filter((s) => s.done);
    expect(done.length).toBe(12);
    const expected = (Math.PI * run.orbit.a * run.orbit.b) / 12;
    for (const s of done.slice(0, 11)) expect(s.area / expected).toBeCloseTo(1, 6);
    const total = done.reduce((sum, s) => sum + s.area, 0);
    expect(total / (Math.PI * run.orbit.a * run.orbit.b)).toBeCloseTo(1, 4);
    // Flächengeschwindigkeit L/(2m)
    expect(done[0]!.area / run.dtSector).toBeCloseTo(run.orbit.arealVelocity, 6);
  });

  it('Energie bleibt erhalten (Verlet): Schwankung unter 10⁻⁴', () => {
    const run = new OrbitRun({ r0: 0.59, v0: 54.38, alpha: 90, M: 1, n: 12, closed: true });
    const e0 = energies(run.s, 1).total;
    let worst = 0;
    for (let i = 0; i < 200; i++) {
      run.advance(run.orbit.T / 100, 1e7);
      worst = Math.max(worst, Math.abs(energies(run.s, 1).total / e0 - 1));
    }
    expect(run.orbit.e).toBeGreaterThan(0.96);
    expect(worst).toBeLessThan(1e-4);
    expect(run.lap!.T / run.orbit.T).toBeCloseTo(1, 3);
  });

  it('3. Keplersches Gesetz aus der Messung: T²/a³ unabhängig von der Bahn, ∝ 1/M', () => {
    const ratios = [
      { r0: 0.5, v0: 45, M: 1 },
      { r0: 1, v0: 36, M: 1 },
      { r0: 3, v0: 14, M: 1 },
      { r0: 1, v0: 40, M: 2 },
    ].map((o) => {
      const run = new OrbitRun({ ...o, alpha: 90, n: 8, closed: true });
      run.advance(run.orbit.T * 1.05, 1e7);
      return keplerRatio(run.lap!.a, run.lap!.T) / keplerConstant(o.M);
    });
    for (const q of ratios) expect(q).toBeCloseTo(1, 4);
  });

  it('Fluchtbahn: Abstand wächst immer weiter, keine Messung', () => {
    const run = new OrbitRun({ r0: 1, v0: 46, alpha: 90, M: 1, n: 12, closed: true });
    expect(run.closed).toBe(false);
    run.advance(run.tRef * 3, 1e7);
    expect(run.r).toBeGreaterThan(3);
    expect(run.lap).toBeNull();
    expect(energies(run.s, 1).total).toBeGreaterThan(0);
  });

  it('Sturz in den Stern wird erkannt', () => {
    const run = new OrbitRun({ r0: 1, v0: 2, alpha: 30, M: 1, n: 12, closed: true });
    run.advance(run.orbit.T, 1e8);
    expect(run.crashed).toBe(true);
  });
});

describe('Modell: Planetenbahnen – reale Planeten', () => {
  it('Umlaufdauern passen zu den bekannten Werten', () => {
    const days = Object.fromEntries(PLANETS.map((p) => [p.id, planetPeriod(p) * 365.25]));
    expect(days.mercury).toBeCloseTo(87.97, 1);
    expect(days.venus).toBeCloseTo(224.7, 1);
    expect(days.earth).toBeCloseTo(365.26, 1);
    expect(days.mars).toBeCloseTo(686.98, 1);
    expect(planetPeriod(PLANETS[4]!)).toBeCloseTo(11.86, 2);
    expect(planetPeriod(PLANETS[7]!)).toBeCloseTo(164.79, 1);
  });

  it('T²/a³ ist für alle Planeten gleich (Abweichung < 0,2 %)', () => {
    for (const p of PLANETS) {
      const q = keplerRatio(p.a, planetPeriod(p)) / keplerConstant(1);
      expect(Math.abs(q - 1)).toBeLessThan(0.002);
    }
  });
});
