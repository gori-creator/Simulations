import { describe, expect, it } from 'vitest';
import {
  arrivalTime,
  CHAIN_LENGTH,
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
});
