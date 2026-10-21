import { describe, expect, it } from 'vitest';
import {
  arrivalTime,
  CHAIN_LENGTH,
  chainResolves,
  MIN_RESOLVED_WAVELENGTH,
  compressionPositions,
  crestPositions,
  displacement,
  frontPosition,
  inPhasePartner,
  leadingCrest,
  maxStrain,
  nearestParticle,
  particleAt,
  particleVelocity,
  PARTICLES,
  period,
  phaseAt,
  phaseDifference,
  rarefactionPositions,
  relativeDensity,
  restPosition,
  sourceDisplacement,
  strain,
  troughPositions,
  wavelength,
  type Wave,
} from '../src/simulations/physik/wellen-ausbreitung/model';

const W: Wave = { f: 0.8, c: 1.2, amp: 0.1, exc: 'cont' };

describe('Modell: Transversal- und Longitudinalwellen', () => {
  it('c = λ · f: λ = c / f und T = 1 / f', () => {
    expect(wavelength(W)).toBeCloseTo(1.5, 12);
    expect(period(W)).toBeCloseTo(1.25, 12);
    expect(wavelength({ c: 340, f: 440 })).toBeCloseTo(0.7727, 4);
  });

  it('Kette: 41 Teilchen im Abstand 10 cm auf 4 m', () => {
    expect(PARTICLES).toBe(41);
    expect(restPosition(40)).toBeCloseTo(CHAIN_LENGTH, 12);
    expect(nearestParticle(1.04)).toBe(10);
    expect(nearestParticle(-3)).toBe(0);
    expect(nearestParticle(9)).toBe(40);
  });

  it('vor der Wellenfront herrscht Ruhe', () => {
    const t = 2;
    expect(frontPosition(W, t)).toBeCloseTo(2.4, 12);
    expect(displacement(W, 2.5, t)).toBe(0);
    expect(particleVelocity(W, 2.5, t)).toBe(0);
    expect(phaseAt(W, 2.5, t)).toBeNull();
    expect(frontPosition(W, 100)).toBe(CHAIN_LENGTH);
  });

  it('jedes Teilchen wiederholt die Bewegung des Erregers mit der Verspätung x / c', () => {
    const x = 1.8;
    expect(arrivalTime(W, x)).toBeCloseTo(1.5, 12);
    for (const t of [1.6, 2.3, 4.1]) expect(displacement(W, x, t)).toBeCloseTo(sourceDisplacement(W, t - 1.5), 12);
    // Wert: y = ŷ · sin(2π(t/T − x/λ))
    const t = 3.1;
    expect(displacement(W, x, t)).toBeCloseTo(0.1 * Math.sin(2 * Math.PI * (t / 1.25 - x / 1.5)), 12);
  });

  it('Teilchen im Abstand λ schwingen gleichphasig, im Abstand λ/2 gegenphasig', () => {
    const t = 5;
    expect(displacement(W, 0.4 + 1.5, t)).toBeCloseTo(displacement(W, 0.4, t), 12);
    expect(displacement(W, 0.4 + 0.75, t)).toBeCloseTo(-displacement(W, 0.4, t), 12);
    expect(phaseDifference(W, 0.4, 1.9)).toBeCloseTo(2 * Math.PI, 12);
    expect(phaseDifference(W, 0, 0.375)).toBeCloseTo(Math.PI / 2, 12);
  });

  it('die Welle läuft mit c weiter: y(x + c·Δt, t + Δt) = y(x, t)', () => {
    const dt = 0.7;
    expect(displacement(W, 1 + 1.2 * dt, 3 + dt)).toBeCloseTo(displacement(W, 1, 3), 12);
  });

  it('Teilchen wandern nicht mit: Auslenkung bleibt zwischen −ŷ und ŷ, Mittelwert über eine Periode 0', () => {
    let sum = 0;
    let max = 0;
    const n = 400;
    for (let i = 0; i < n; i++) {
      const y = displacement(W, 2, 10 + (i / n) * period(W));
      sum += y;
      max = Math.max(max, Math.abs(y));
    }
    expect(Math.abs(sum / n)).toBeLessThan(1e-12);
    expect(max).toBeLessThanOrEqual(0.1 + 1e-12);
    expect(max).toBeGreaterThan(0.0999);
  });

  it('Einzelpuls: nur eine halbe Schwingung, danach wieder Ruhe', () => {
    const P: Wave = { ...W, exc: 'pulse' };
    const T = period(P);
    expect(sourceDisplacement(P, T / 4)).toBeCloseTo(0.1, 12);
    expect(sourceDisplacement(P, 0.6 * T)).toBe(0);
    // Puls ist λ/2 breit: an der Stelle x ist er zwischen x/c und x/c + T/2
    expect(displacement(P, 1, 1 / 1.2 + T / 4)).toBeCloseTo(0.1, 12);
    expect(displacement(P, 1, 1 / 1.2 + 0.55 * T)).toBe(0);
    expect(crestPositions(P, 2)).toHaveLength(1);
    expect(crestPositions(P, 2)[0]).toBeCloseTo(1.2 * (2 - T / 4), 12);
    expect(troughPositions(P, 2)).toHaveLength(0);
    const O: Wave = { ...W, exc: 'one' };
    expect(troughPositions(O, 3)).toHaveLength(1);
    expect(sourceDisplacement(O, 1.01 * period(O))).toBe(0);
  });

  it('Wellenberge im Abstand λ; der vorderste wird verfolgt', () => {
    const t = 3;
    const crests = crestPositions(W, t);
    // erster Wellenberg: zur Zeit T/4 am Erreger losgelaufen
    expect(crests[0]).toBeCloseTo(1.2 * (t - 1.25 / 4), 12);
    expect(crests[0]! - crests[1]!).toBeCloseTo(1.5, 12);
    for (const x of crests) expect(displacement(W, x, t)).toBeCloseTo(0.1, 12);
    for (const x of troughPositions(W, t)) expect(displacement(W, x, t)).toBeCloseTo(-0.1, 12);
    expect(leadingCrest(W, t)).toBeCloseTo(crests[0]!, 12);
    expect(leadingCrest(W, 0.1)).toBeNull();
  });

  it('Longitudinalwelle: Dehnung = −v/c, Verdichtungen und Verdünnungen', () => {
    const t = 4;
    expect(maxStrain(W)).toBeCloseTo((0.1 * 2 * Math.PI * 0.8) / 1.2, 12);
    const x = 0.9;
    const h = 1e-6;
    const numeric = (displacement(W, x + h, t) - displacement(W, x - h, t)) / (2 * h);
    expect(strain(W, x, t)).toBeCloseTo(numeric, 6);
    for (const xc of compressionPositions(W, t)) {
      if (xc >= CHAIN_LENGTH - 1e-9 || xc <= 1e-9) continue;
      expect(relativeDensity(W, xc - 1e-9, t)).toBeCloseTo(1 / (1 - maxStrain(W)), 6);
    }
    for (const xr of rarefactionPositions(W, t)) expect(relativeDensity(W, xr, t)).toBeCloseTo(1 / (1 + maxStrain(W)), 6);
    // zu große Amplitude: Teilchen würden sich überholen
    expect(relativeDensity({ ...W, amp: 0.4 }, compressionPositions(W, t)[1]!, t)).toBe(Infinity);
  });

  it('gleichphasiger Partner: eine Wellenlänge weiter, sonst zurück', () => {
    expect(inPhasePartner(W, 1)).toBeCloseTo(2.5, 12);
    expect(particleAt(2.5)).toBe(25);
    expect(inPhasePartner(W, 3)).toBeCloseTo(1.5, 12);
    expect(inPhasePartner({ c: 2, f: 0.2 }, 1)).toBeNull();
    expect(particleAt(1.234)).toBeNull();
  });

  it('Prüfwerte der Prüfrunde (von Hand nachgerechnet)', () => {
    // Startbild: Nr. 10 (x = 1 m) bei t = 2,8/1,2 s: τ = 1,5 s, φ = 2π · 0,8 · 1,5 = 2,4π
    const t0 = 2.8 / 1.2;
    expect(displacement(W, 1, t0) * 100).toBeCloseTo(10 * Math.sin(0.4 * Math.PI), 9); // 9,51 cm
    expect(particleVelocity(W, 1, t0)).toBeCloseTo(0.1 * 2 * Math.PI * 0.8 * Math.cos(0.4 * Math.PI), 9); // 0,155 m/s
    // Einzelpuls: Nr. 20 (x = 2 m) bei t = 1,4 + 0,3125 s → y ≈ 2,3 cm, Wellenberg bei x = 1,68 m
    const P: Wave = { ...W, exc: 'pulse' };
    expect(displacement(P, 2, 1.7125) * 100).toBeCloseTo(2.28, 2);
    expect(crestPositions(P, 1.7125)).toEqual([expect.closeTo(1.68, 9)]);
    // Longitudinal f = 0,6 Hz, ŷ = 12 cm: λ = 2 m, Verdichtungen bei 3,2 m (Front) und 1,2 m
    const Lw: Wave = { f: 0.6, c: 1.2, amp: 0.12, exc: 'cont' };
    const t1 = 3.2 / 1.2;
    expect(wavelength(Lw)).toBeCloseTo(2, 12);
    expect(displacement(Lw, 1, t1) * 100).toBeCloseTo(12 * Math.sin(0.2 * Math.PI), 9); // 7,05 cm
    expect(compressionPositions(Lw, t1).map((x) => +x.toFixed(9))).toEqual([3.2, 1.2]);
    expect(rarefactionPositions(Lw, t1).map((x) => +x.toFixed(9))).toEqual([2.2, 0.2]);
    // Aufgabe 2: λ = 0,8 m, T = 0,8 s → c = 1 m/s; Aufgabe 3: Nr. 30 nach 2,5 s, Δφ = 4π
    expect(0.8 * (1 / 0.8)).toBeCloseTo(1, 12);
    expect(arrivalTime(W, 3)).toBeCloseTo(2.5, 12);
    expect(phaseDifference(W, 0, 3)).toBeCloseTo(4 * Math.PI, 12);
    // Aufgabe 7: 1480/440 ≈ 3,36 m
    expect(wavelength({ c: 1480, f: 440 })).toBeCloseTo(3.364, 3);
  });

  it('Sonderfälle an den Reglergrenzen: kurze und lange Wellenlänge', () => {
    // f = 2 Hz, c = 0,2 m/s: λ = 0,1 m = Teilchenabstand → alle Teilchen gleichphasig, Kette löst nicht auf
    const S: Wave = { f: 2, c: 0.2, amp: 0.1, exc: 'cont' };
    expect(wavelength(S)).toBeCloseTo(0.1, 12);
    expect(chainResolves(S)).toBe(false);
    const t = 12;
    for (let i = 1; i <= 20; i++) expect(displacement(S, restPosition(i), t)).toBeCloseTo(displacement(S, 0, t), 9);
    // Grenze genau bei drei Teilchenabständen
    expect(MIN_RESOLVED_WAVELENGTH).toBeCloseTo(0.3, 12);
    expect(chainResolves({ f: 2, c: 0.6 })).toBe(true);
    expect(chainResolves({ f: 2, c: 0.55 })).toBe(false);
    expect(chainResolves(W)).toBe(true);
    // f = 0,2 Hz, c = 2 m/s: λ = 10 m > Kette → kein gleichphasiger Partner, T = 5 s
    const B = { f: 0.2, c: 2 };
    expect(wavelength(B)).toBeCloseTo(10, 12);
    expect(period(B)).toBeCloseTo(5, 12);
    expect(inPhasePartner(B, 1)).toBeNull();
    // Wellenfront: beim Start (t = 0) in Ruhe, danach x = c · t, am Ende festgehalten
    expect(frontPosition(W, 0)).toBe(0);
    expect(displacement(W, 0, 0)).toBe(0);
    expect(frontPosition(W, 1)).toBeCloseTo(1.2, 12);
    expect(frontPosition(W, 100)).toBe(CHAIN_LENGTH);
  });
});
