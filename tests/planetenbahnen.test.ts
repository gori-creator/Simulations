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

describe('Modell: Planetenbahnen – Prüfrunde (Langzeit, Sonderfälle, Aufgaben)', () => {
  it('keine Drift über 200 Umläufe: Energie, Drehimpuls und Bahn bleiben erhalten (auch beim Kometen)', () => {
    for (const [r0, v0, tolE, tolA] of [
      [1, 36, 1e-5, 1e-7],
      [0.59, 54.38, 2e-4, 2e-4],
    ] as const) {
      const run = new OrbitRun({ r0, v0, alpha: 90, M: 1, n: 12, closed: true });
      const E0 = energies(run.s, 1).total;
      const L0 = run.s.x * run.s.vy - run.s.y * run.s.vx;
      const T = run.orbit.T;
      let dE = 0;
      for (let i = 0; i < 200 * 10; i++) {
        run.advance(T / 10, 1e9);
        dE = Math.max(dE, Math.abs(energies(run.s, 1).total / E0 - 1));
      }
      expect(dE).toBeLessThan(tolE);
      expect(Math.abs((run.s.x * run.s.vy - run.s.y * run.s.vx) / L0 - 1)).toBeLessThan(1e-11);
      const o = orbitFromState(run.s, 1);
      expect(Math.abs(o.a / run.orbit.a - 1)).toBeLessThan(tolA);
      // Periheldrehung durch das Rechenverfahren nach 200 Umläufen unter 0,1°
      const dw = Math.atan2(Math.sin(o.omega - run.orbit.omega), Math.cos(o.omega - run.orbit.omega));
      expect(Math.abs((dw * 180) / Math.PI)).toBeLessThan(0.1);
    }
  }, 60000);

  it('v₀ = 0: freier Fall in den Stern, von 1 AE in ≈ 64,6 d (halbe Umlaufdauer der Ellipse mit a = r₀/2)', () => {
    const o = orbitFromState(startState(1, 0, 90), 1);
    expect(o.hitsStar).toBe(true);
    const tFall = Math.PI * Math.sqrt(0.5 ** 3 / MU_SUN);
    expect(tFall * 365.25).toBeCloseTo(64.6, 1);
    const run = new OrbitRun({ r0: 1, v0: 0, alpha: 90, M: 1, n: 12, closed: true });
    while (!run.crashed && run.t < 1) run.advance(0.001, 1e7);
    expect(run.crashed).toBe(true);
    expect(run.t * 365.25).toBeGreaterThan(64);
    expect(run.t * 365.25).toBeLessThan(64.7);
  }, 30000);

  it('Reglergrenzen: kleinste Geschwindigkeit stürzt bei r₀ = 0,3 AE ab, größte ist fast überall Flucht', () => {
    const crash = orbitFromState(startState(0.3, 2, 90), 1);
    expect(crash.hitsStar).toBe(true);
    // Fallzeit aus dem Aphel ≈ T/2 = π·√(a³/(G·M)) mit a ≈ 0,15 AE ≈ 10,6 d
    expect((crash.T / 2) * 365.25).toBeCloseTo(10.6, 1);
    expect(orbitFromState(startState(5.5, 2, 90), 1).hitsStar).toBe(false);
    for (const r0 of [1, 5.5]) {
      for (const M of [0.2, 1, 3]) expect(orbitFromState(startState(r0, 80, 30), M).kind).toBe('hyperbola');
    }
    // r₀ = 0,3 AE, M = 3 M☉: v_F ≈ 133 km/s > 80 km/s → gebunden
    expect(escapeSpeed(0.3, 3)).toBeCloseTo(133.2, 1);
    expect(orbitFromState(startState(0.3, 80, 90), 3).bound).toBe(true);
  });

  it('Werte der Aufgaben im Lernmaterial', () => {
    // A1: v_K = √(G·M/r) ≈ 29,8 km/s
    expect(circularSpeed(1, 1)).toBeCloseTo(29.78, 2);
    expect(orbitFromState(startState(1, 29.78, 90), 1).kind).toBe('circle');
    // A2: E = ½·v² − G·M/r > 0 bei 46 km/s
    const e2 = energies(startState(1, 46, 90), 1);
    expect(e2.kin / 1e8).toBeCloseTo(10.58, 2);
    expect(-e2.pot / 1e8).toBeCloseTo(8.87, 2);
    expect(e2.total).toBeGreaterThan(0);
    // A3: r_A = 2,71 AE, v_A = 13,3 km/s, a ≈ 1,855 AE, ε ≈ 0,461
    const o3 = orbitFromState(startState(1, 36, 90), 1);
    expect(o3.rA).toBeCloseTo(2.71, 2);
    expect(o3.vA).toBeCloseTo(13.28, 2);
    expect(o3.a).toBeCloseTo(1.855, 3);
    expect(o3.e).toBeCloseTo(0.461, 3);
    // A4: Mars T = √1,524³ ≈ 1,88 a; Jupiter a = ∛11,86² ≈ 5,20 AE; Link: a ≈ 1,52 AE
    expect(Math.sqrt(1.524 ** 3)).toBeCloseTo(1.88, 2);
    expect(Math.cbrt(11.86 ** 2)).toBeCloseTo(5.2, 2);
    const o4 = orbitFromState(startState(1.38, 26.51, 90), 1);
    expect(o4.a).toBeCloseTo(1.522, 3);
    expect(o4.T).toBeCloseTo(1.878, 3);
    // A5: Halley-Link: a ≈ 17,7 AE, T ≈ 74,7 a, r_A ≈ 34,9 AE
    const o5 = orbitFromState(startState(0.59, 54.38, 90), 1);
    expect(o5.a).toBeCloseTo(17.73, 2);
    expect(o5.T).toBeCloseTo(74.67, 2);
    expect(o5.rA).toBeCloseTo(34.87, 2);
    // A6: M = 4π²·a³/(G·T²) ≈ 1,99·10³⁰ kg
    const M = (4 * Math.PI ** 2 * 1.496e11 ** 3) / (6.674e-11 * (365.26 * 86400) ** 2);
    expect(M / 1e30).toBeCloseTo(1.99, 2);
  });
});
