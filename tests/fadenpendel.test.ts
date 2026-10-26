import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  agm,
  amplitudeForDeviation,
  amplitudeHalfLife,
  angularAcceleration,
  crossingTime,
  energies,
  envelope,
  exactPeriod,
  fitSeries,
  forces,
  harmonic,
  lengthForPeriod,
  maxSpeed,
  omega0,
  periodFactor,
  PLANETS,
  reactionError,
  releaseEnergy,
  returnTimes,
  secondsPendulumLength,
  seriesFactor,
  slackAngle,
  slopeThroughOrigin,
  smallAnglePeriod,
  speedAt,
  step,
  tension,
  toDeg,
  toRad,
  type State,
} from '../src/simulations/physik/fadenpendel/model';

const G = 9.81;

/** Integriert mit fester Schrittweite über die Zeit T. */
function run(state: State, l: number, g: number, gamma: number, T: number, h = 0.0005): [number, number] {
  let s: [number, number] = [state[0], state[1]];
  const n = Math.round(T / h);
  for (let i = 0; i < n; i++) s = step(s, l, g, gamma, h);
  return s;
}

const total = (s: State, l: number, g: number, m: number) => {
  const e = energies(s, l, g, m);
  return e.pot + e.kin;
};

describe('Modell: Fadenpendel', () => {
  it('Kleinwinkelnäherung T₀ = 2π·√(l/g)', () => {
    // l = 1 m: 2π·√(1/9,81) = 2,006 s
    expect(smallAnglePeriod(1, G)).toBeCloseTo(2.006, 3);
    // l = 0,25 m: ein Viertel der Länge → halbe Periodendauer 1,003 s
    expect(smallAnglePeriod(0.25, G)).toBeCloseTo(1.003, 3);
    expect(smallAnglePeriod(0.25, G) / smallAnglePeriod(1, G)).toBeCloseTo(0.5, 12);
    // Mond: 2π·√(1/1,62) = 4,937 s
    expect(smallAnglePeriod(1, PLANETS.mond.g)).toBeCloseTo(4.937, 3);
    // l = 0,5 m und 2 m (Aufgabe im Lernmaterial)
    expect(smallAnglePeriod(0.5, G)).toBeCloseTo(1.4185, 4);
    expect(smallAnglePeriod(2, G)).toBeCloseTo(2.8370, 4);
    expect(omega0(1, G)).toBeCloseTo(Math.sqrt(G), 12);
  });

  it('Sekundenpendel: l = g/π² = 0,9940 m → T₀ = 2,000 s', () => {
    expect(secondsPendulumLength(G)).toBeCloseTo(G / Math.PI ** 2, 12);
    expect(secondsPendulumLength(G)).toBeCloseTo(0.994, 4);
    expect(smallAnglePeriod(secondsPendulumLength(G), G)).toBeCloseTo(2, 12);
    // Reglerwert l = 0,99 m: 1,996 s ≈ 2,00 s
    expect(smallAnglePeriod(0.99, G)).toBeCloseTo(1.996, 3);
    expect(lengthForPeriod(smallAnglePeriod(1.7, 3.71), 3.71)).toBeCloseTo(1.7, 12);
  });

  it('exakte Periodendauer über das arithmetisch-geometrische Mittel', () => {
    expect(agm(1, 1)).toBe(1);
    expect(agm(24, 6)).toBeCloseTo(13.458171481725616, 12);
    // φ₀ = 20°: Faktor 1,00767 → T = 2,0215 s
    expect(periodFactor(toRad(20))).toBeCloseTo(1.00767, 5);
    expect(exactPeriod(1, G, toRad(20))).toBeCloseTo(2.0215, 4);
    // φ₀ = 90°: Faktor 1,18034 → 2,3678 s
    expect(periodFactor(toRad(90))).toBeCloseTo(1.18034, 5);
    expect(exactPeriod(1, G, toRad(90))).toBeCloseTo(2.3678, 4);
    // φ₀ = 170°: Faktor 2,4394
    expect(periodFactor(toRad(170))).toBeCloseTo(2.4394, 4);
    // symmetrisch und bei 0° genau die Näherung
    expect(periodFactor(toRad(-90))).toBe(periodFactor(toRad(90)));
    expect(periodFactor(0)).toBe(1);
    expect(periodFactor(Math.PI)).toBe(Infinity);
  });

  it('Reihenentwicklung 1 + φ₀²/16 + 11φ₀⁴/3072 passt bei kleinen Winkeln', () => {
    for (const d of [5, 10, 20, 30]) expect(seriesFactor(toRad(d))).toBeCloseTo(periodFactor(toRad(d)), 5);
    expect(seriesFactor(toRad(20), 1)).toBeCloseTo(1 + toRad(20) ** 2 / 16, 12);
    // bei großen Winkeln liegt die Reihe deutlich darunter
    expect(seriesFactor(toRad(150))).toBeLessThan(periodFactor(toRad(150)) - 0.15);
  });

  it('ab etwa 22,8° weicht die Näherung um mehr als 1 % ab', () => {
    const a = toDeg(amplitudeForDeviation(0.01));
    expect(a).toBeCloseTo(22.81, 2);
    expect(periodFactor(toRad(22))).toBeLessThan(1.01);
    expect(periodFactor(toRad(23))).toBeGreaterThan(1.01);
    // 0,1 % erst ab etwa 7,2°
    expect(toDeg(amplitudeForDeviation(0.001))).toBeCloseTo(7.24, 2);
    // der Faktor wächst streng mit der Amplitude
    let last = 1;
    for (let d = 1; d <= 175; d++) {
      const f = periodFactor(toRad(d));
      expect(f).toBeGreaterThan(last);
      last = f;
    }
  });

  it('Energie: m = 0,5 kg, l = 1 m, φ₀ = 20°', () => {
    const e = energies([toRad(20), 0], 1, G, 0.5);
    // h = 1 m · (1 − cos 20°) = 0,06031 m
    expect(e.height).toBeCloseTo(0.06031, 5);
    // E_pot = 0,5 kg · 9,81 N/kg · 0,06031 m = 0,2958 J
    expect(e.pot).toBeCloseTo(0.2958, 4);
    expect(e.kin).toBe(0);
    expect(releaseEnergy(toRad(20), 1, G, 0.5)).toBeCloseTo(e.pot, 12);
    // v_max = √(2gh) = 1,0878 m/s, unabhängig von der Masse
    expect(maxSpeed(toRad(20), 1, G)).toBeCloseTo(1.0878, 4);
    expect(speedAt(0, toRad(20), 1, G)).toBeCloseTo(1.0878, 4);
    expect(speedAt(toRad(25), toRad(20), 1, G)).toBeNaN();
  });

  it('ohne Dämpfung bleibt die Energie erhalten und die Periode stimmt (numerisch)', () => {
    for (const d of [5, 20, 60, 120, 170]) {
      const a = toRad(d);
      const l = 1.3;
      const T = exactPeriod(l, G, a);
      const e0 = releaseEnergy(a, l, G, 0.7);
      let s: State = [a, 0];
      // über 20 Perioden
      for (let k = 0; k < 20; k++) {
        s = run(s, l, G, 0, T);
        expect(Math.abs(total(s, l, G, 0.7) - e0) / e0).toBeLessThan(1e-4);
      }
      // nach 20 vollen Perioden wieder am Startpunkt
      expect(s[0]).toBeCloseTo(a, 2);
      // gemessene Rückkehrzeiten = exakte Periodendauer
      const times = returnTimes(l, G, a, 0, 3);
      expect(times).toHaveLength(3);
      expect(times[0]).toBeCloseTo(T, 4);
      expect(times[2]! - times[1]!).toBeCloseTo(T, 4);
    }
  });

  it('die Masse ändert die Bewegung nicht (nur die Energien)', () => {
    const a: State = [toRad(35), 0];
    const s1 = run(a, 0.8, G, 0.1, 3.3);
    const s2 = run(a, 0.8, G, 0.1, 3.3);
    expect(s1).toEqual(s2);
    // in der Bewegungsgleichung kommt m gar nicht vor; Energien verdoppeln sich mit m
    expect(energies(s1, 0.8, G, 2).kin).toBeCloseTo(2 * energies(s1, 0.8, G, 1).kin, 12);
    expect(returnTimes(0.8, G, toRad(35), 0, 1)[0]).toBeCloseTo(exactPeriod(0.8, G, toRad(35)), 4);
  });

  it('mit Dämpfung fällt die Energie monoton, Amplitude etwa mit e^(−γt)', () => {
    const l = 1;
    const gamma = 0.2;
    let s: [number, number] = [toRad(10), 0];
    let last = total(s, l, G, 1);
    for (let i = 0; i < 20000; i++) {
      s = step(s, l, G, gamma, 0.0005);
      const e = total(s, l, G, 1);
      expect(e).toBeLessThanOrEqual(last + 1e-12);
      last = e;
    }
    // nach 10 s: Amplitude ≈ 10° · e^(−2) (kleiner Winkel → fast harmonisch)
    const times = returnTimes(l, G, toRad(10), gamma, 5);
    const sN = run([toRad(10), 0], l, G, gamma, times[4]!);
    expect(toDeg(sN[0]) / 10).toBeCloseTo(Math.exp(-gamma * times[4]!), 2);
    expect(envelope(2, toRad(10), gamma)).toBeCloseTo(toRad(10) * Math.exp(-0.4), 12);
    expect(amplitudeHalfLife(gamma)).toBeCloseTo(Math.LN2 / 0.2, 12);
    expect(amplitudeHalfLife(0)).toBe(Infinity);
  });

  it('harmonische Lösung stimmt bei kleinen Winkeln mit der exakten Bewegung überein', () => {
    for (const gamma of [0, 0.15]) {
      const a = toRad(2);
      const s = run([a, 0], 0.6, G, gamma, 4.1);
      const h = harmonic(4.1, a, 0.6, G, gamma);
      expect(s[0]).toBeCloseTo(h[0], 4);
      expect(s[1]).toBeCloseTo(h[1], 3);
    }
    // Anfangszustand: Ruhe bei φ₀
    expect(harmonic(0, 0.3, 1, G, 0.2)[0]).toBeCloseTo(0.3, 12);
    expect(harmonic(0, 0.3, 1, G, 0.2)[1]).toBeCloseTo(0, 12);
    // bei 90° läuft die Näherung sichtbar davon: nach 5 Perioden um mehr als 30° verschieden
    const a = toRad(90);
    const T0 = smallAnglePeriod(1, G);
    expect(Math.abs(toDeg(run([a, 0], 1, G, 0, 5 * T0)[0] - harmonic(5 * T0, a, 1, G, 0)[0]))).toBeGreaterThan(30);
  });

  it('Kräfte: Rückstellkraft m·g·sin φ, Fadenkraft m·g·cos φ + m·v²/l', () => {
    const f = forces([toRad(30), 0], 1, G, 0.5);
    expect(f.weight).toBeCloseTo(4.905, 12);
    expect(f.restoring).toBeCloseTo(-2.4525, 10);
    expect(f.radial).toBeCloseTo(4.905 * Math.cos(toRad(30)), 12);
    expect(f.tension).toBeCloseTo(f.radial, 12);
    // tiefster Punkt nach Loslassen bei 90°: F_S = m·g·(3 − 0) = 3·m·g = 14,715 N
    expect(tension(0, toRad(90), G, 0.5)).toBeCloseTo(14.715, 10);
    const s: State = [0, maxSpeed(toRad(90), 1, G) / 1];
    expect(forces(s, 1, G, 0.5).tension).toBeCloseTo(14.715, 10);
    expect(forces(s, 1, G, 0.5).centripetal).toBeCloseTo(2 * 4.905, 10);
    expect(angularAcceleration([toRad(30), 0], 2, G, 0)).toBeCloseTo((-G / 2) * 0.5, 12);
  });

  it('Faden würde nur oberhalb von 90° schlaff', () => {
    expect(slackAngle(toRad(90))).toBeNull();
    expect(slackAngle(toRad(60))).toBeNull();
    // 120°: cos φ = ⅔ · (−½) → φ = 109,47°
    expect(toDeg(slackAngle(toRad(120))!)).toBeCloseTo(109.47, 2);
    expect(tension(toRad(120), toRad(120), G, 1)).toBeLessThan(0);
    expect(tension(slackAngle(toRad(120))!, toRad(120), G, 1)).toBeCloseTo(0, 10);
    for (let d = 1; d <= 90; d++) expect(tension(toRad(d), toRad(d), G, 1)).toBeGreaterThanOrEqual(-1e-9);
  });

  it('Messreihe: T² über l ergibt g aus der Steigung (auch mit Reaktionszeit)', () => {
    const exact = [0.25, 0.5, 1, 1.5, 2].map((l) => ({ l, T: smallAnglePeriod(l, G) }));
    const fit = fitSeries(exact)!;
    expect(fit.slope).toBeCloseTo((4 * Math.PI ** 2) / G, 10);
    expect(fit.g).toBeCloseTo(G, 10);
    expect(fit.lengths).toBe(5);
    expect(fitSeries([{ l: 1, T: 2 }])).toBeNull();
    expect(fitSeries([{ l: 1, T: 2 }, { l: 1, T: 2.01 }])).toBeNull();
    expect(slopeThroughOrigin([1, 2], [2, 4])).toBeCloseTo(2, 12);
    // zufällige Handstoppung über 10 Schwingungen: g höchstens wenige Prozent daneben
    const rand = seededRandom(7);
    for (let k = 0; k < 200; k++) {
      const e = reactionError(rand);
      expect(Math.abs(e)).toBeLessThanOrEqual(0.18);
    }
    for (const planet of ['erde', 'mond', 'mars', 'jupiter'] as const) {
      const g = PLANETS[planet].g;
      const list = [0.4, 0.8, 1.2, 1.6, 2].map((l) => ({ l, T: (10 * smallAnglePeriod(l, g) + reactionError(rand)) / 10 }));
      expect(Math.abs(fitSeries(list)!.g / g - 1)).toBeLessThan(0.04);
    }
  });

  it('Plausibilität über viele Zufallswerte: T wächst mit l und φ₀, fällt mit g', () => {
    const rand = seededRandom(3);
    for (let i = 0; i < 300; i++) {
      const l = 0.2 + rand() * 2.3;
      const g = [1.62, 3.71, 9.81, 24.79][i % 4]!;
      const a = toRad(rand() * 170);
      const T = exactPeriod(l, g, a);
      expect(T).toBeGreaterThanOrEqual(smallAnglePeriod(l, g) - 1e-12);
      expect(exactPeriod(l * 1.1, g, a)).toBeGreaterThan(T);
      expect(exactPeriod(l, g * 1.1, a)).toBeLessThan(T);
      expect(exactPeriod(l, g, a + 0.01)).toBeGreaterThan(T);
      // Lageenergie = m·g·h ≥ 0, Fadenkraft im tiefsten Punkt ≥ m·g
      expect(releaseEnergy(a, l, g, 1)).toBeGreaterThanOrEqual(0);
      expect(tension(0, a, g, 1)).toBeGreaterThanOrEqual(g - 1e-9);
    }
    expect(crossingTime(1, 2, 2, -2)).toBeCloseTo(1.5, 12);
  });

  it('Aufgabenwerte aus dem Lernmaterial (Prüfrunde)', () => {
    // A1: Sekundenpendel l = 9,81 · (2/2π)² = 0,994 m; Reglerwert 0,99 m → 2,00 s
    expect(lengthForPeriod(2, G)).toBeCloseTo(0.994, 3);
    expect(smallAnglePeriod(0.99, G)).toBeCloseTo(1.996, 3);
    // A2: Messreihe 0,5/1,0/1,5 m mit 1,42/2,01/2,46 s → k ≈ 4,036 s²/m, g ≈ 9,78 m/s²
    const fit = fitSeries([
      { l: 0.5, T: 1.42 },
      { l: 1, T: 2.01 },
      { l: 1.5, T: 2.46 },
    ])!;
    expect(fit.slope).toBeCloseTo(4.036, 3);
    expect(fit.g).toBeCloseTo(9.78, 2);
    // A3: Mond, 1 m → 4,94 s, Faktor √(9,81/1,62) ≈ 2,46
    expect(smallAnglePeriod(1, PLANETS.mond.g)).toBeCloseTo(4.937, 3);
    expect(Math.sqrt(G / PLANETS.mond.g)).toBeCloseTo(2.461, 3);
    // A4: 20°, 1 m, 0,5 kg → h = 0,0603 m, E = 0,296 J, v = 1,09 m/s; aus 90°: F_S = 3·m·g = 14,7 N
    expect(energies([toRad(20), 0], 1, G, 0.5).height).toBeCloseTo(0.0603, 4);
    expect(releaseEnergy(toRad(20), 1, G, 0.5)).toBeCloseTo(0.296, 3);
    expect(maxSpeed(toRad(20), 1, G)).toBeCloseTo(1.088, 3);
    expect(tension(0, toRad(90), G, 0.5)).toBeCloseTo(14.715, 3);
    // A5: 90° → T/T₀ = 1,180, T = 2,37 s; 120° → schlaff ab |φ| = arccos(−1/3) = 109,5°
    expect(periodFactor(toRad(90))).toBeCloseTo(1.1803, 4);
    expect(exactPeriod(1, G, toRad(90))).toBeCloseTo(2.368, 3);
    expect(toDeg(slackAngle(toRad(120))!)).toBeCloseTo(109.47, 2);
    // Unterrichtsideen: bei 20° ist T etwa 0,8 % zu lang
    expect((periodFactor(toRad(20)) - 1) * 100).toBeCloseTo(0.77, 2);
    // Reihe 1 + φ₀²/16 bis 60° auf 0,5 % genau
    expect(Math.abs(seriesFactor(toRad(60), 1) / periodFactor(toRad(60)) - 1)).toBeLessThan(0.005);
  });

  it('Sonderfälle und Reglergrenzen (Prüfrunde)', () => {
    // φ₀ = 0: keine Schwingung, keine Rückkehrzeiten, keine Energie
    expect(returnTimes(1, G, 0, 0, 3)).toEqual([]);
    expect(periodFactor(0)).toBe(1);
    expect(releaseEnergy(0, 1, G, 1)).toBe(0);
    // φ₀ → 180°: Periodendauer unendlich, bei 170° (Reglergrenze) endlich und ≈ 2,44 · T₀
    expect(periodFactor(Math.PI)).toBe(Infinity);
    expect(periodFactor(toRad(170))).toBeCloseTo(2.439, 3);
    // Reglergrenzen der Länge 0,2 m und 2,5 m
    expect(smallAnglePeriod(0.2, G)).toBeCloseTo(0.897, 3);
    expect(smallAnglePeriod(2.5, G)).toBeCloseTo(3.172, 3);
    // numerische Messung bei 170° und 2,5 m stimmt mit der exakten Periodendauer überein
    const ts = returnTimes(2.5, G, toRad(-170), 0, 1);
    expect(ts[0]!).toBeCloseTo(exactPeriod(2.5, G, toRad(170)), 2);
    // Vorzeichen: Rückstellkraft zeigt immer zur Ruhelage
    expect(forces([toRad(30), 0], 1, G, 1).restoring).toBeLessThan(0);
    expect(forces([toRad(-30), 0], 1, G, 1).restoring).toBeGreaterThan(0);
  });
});
