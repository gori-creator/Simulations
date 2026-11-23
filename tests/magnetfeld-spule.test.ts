import { describe, expect, it } from 'vitest';
import {
  B_EARTH,
  coilField,
  commutatorSign,
  compassAngle,
  ellipE,
  ellipK,
  loopAxisB,
  loopCenterB,
  loopField,
  motorMaxTorque,
  motorStep,
  motorTorque,
  MOTOR,
  MU0,
  RELAY,
  relayForce,
  relayState,
  seriesBI,
  solenoidAxisB,
  solenoidB,
  traceLine,
  turnDensity,
  wireB,
  wireForcePerLength,
  wireR,
  wiresField,
} from '../src/simulations/physik/magnetfeld-spule/model';

describe('Magnetfeld: Prüfwerte aus dem Auftrag', () => {
  it('lange Spule N = 500, I = 2 A, l = 0,25 m → B ≈ 5,03 mT', () => {
    expect(solenoidB(500, 2, 0.25) * 1000).toBeCloseTo(5.027, 3);
    expect(turnDensity(500, 0.25)).toBe(2000);
  });
  it('gerader Leiter I = 10 A, r = 2 cm → B = 0,1 mT', () => {
    expect(wireB(10, 0.02)).toBeCloseTo(1e-4, 12);
    expect(wireR(10, 1e-4)).toBeCloseTo(0.02, 12);
  });
  it('μ₀ = 4π · 10⁻⁷ T·m/A; Eisenkern μ_r = 1000 vertausendfacht B', () => {
    expect(MU0).toBeCloseTo(1.2566e-6, 9);
    expect(solenoidB(500, 2, 0.25, 1000) / solenoidB(500, 2, 0.25)).toBeCloseTo(1000, 9);
  });
});

describe('Magnetfeld: gerader Leiter und Überlagerung', () => {
  it('Feld eines Leiters: Betrag μ₀I/(2πr), gegen den Uhrzeigersinn für Strom aus der Ebene', () => {
    const [bx, by] = wiresField([{ x: 0, y: 0, I: 10 }], 0.02, 0);
    expect(bx).toBeCloseTo(0, 15);
    expect(by).toBeCloseTo(1e-4, 12);
    const [bx2] = wiresField([{ x: 0, y: 0, I: 10 }], 0, 0.02);
    expect(bx2).toBeCloseTo(-1e-4, 12);
  });
  it('zwei gleiche, entgegengesetzte Ströme: in der Mitte doppeltes Feld; gleichgerichtet: Feld null', () => {
    const anti = wiresField([{ x: -0.01, y: 0, I: 5 }, { x: 0.01, y: 0, I: -5 }], 0, 0);
    expect(Math.hypot(...anti)).toBeCloseTo(2 * wireB(5, 0.01), 12);
    const same = wiresField([{ x: -0.01, y: 0, I: 5 }, { x: 0.01, y: 0, I: 5 }], 0, 0);
    expect(Math.hypot(...same)).toBeCloseTo(0, 15);
  });
  it('Kraft zwischen Leitern: 1 A, 1 m Abstand → 2 · 10⁻⁷ N/m (alte Ampere-Definition)', () => {
    expect(wireForcePerLength(1, 1, 1)).toBeCloseTo(2e-7, 15);
    expect(wireForcePerLength(10, -10, 0.01)).toBeCloseTo(-2e-3, 12);
  });
  it('Ørsted: ohne Strom zeigt der Kompass nach Norden, bei B = B_Erde um 45°', () => {
    expect(compassAngle(0, 0)).toBe(0);
    expect(compassAngle(B_EARTH, 0)).toBeCloseTo(Math.PI / 4, 12);
  });
  it('Feldlinie um einen Leiter ist ein geschlossener Kreis', () => {
    const f = (x: number, y: number) => wiresField([{ x: 0, y: 0, I: 1 }], x, y);
    const { pts, closed } = traceLine(f, 0.03, 0, { step: 0.0005, maxSteps: 2000, box: { x0: -1, x1: 1, y0: -1, y1: 1 }, closeTol: 0.0008 });
    expect(closed).toBe(true);
    for (const p of pts) expect(Math.hypot(p[0], p[1])).toBeCloseTo(0.03, 3);
  });
});

describe('Magnetfeld: elliptische Integrale und Kreisstrom', () => {
  it('K(0) = E(0) = π/2; K(0,5) ≈ 1,8541, E(0,5) ≈ 1,3506', () => {
    expect(ellipK(0)).toBeCloseTo(Math.PI / 2, 12);
    expect(ellipE(0)).toBeCloseTo(Math.PI / 2, 12);
    expect(ellipK(0.5)).toBeCloseTo(1.854075, 5);
    expect(ellipE(0.5)).toBeCloseTo(1.350644, 5);
  });
  it('Mitte des Kreisstroms: B = μ₀I/(2R); auf der Achse: Formel', () => {
    const [br, bz] = loopField(0.05, 3, 0, 0);
    expect(br).toBe(0);
    expect(bz).toBeCloseTo(loopCenterB(0.05, 3), 12);
    for (const z of [0.01, 0.05, 0.2]) expect(loopField(0.05, 3, 1e-9, z)[1]).toBeCloseTo(loopAxisB(0.05, 3, z), 10);
  });
  it('weit weg wie ein Dipol: auf der Achse ∝ 1/z³', () => {
    const r = loopAxisB(0.01, 1, 2) / loopAxisB(0.01, 1, 4);
    expect(r).toBeCloseTo(8, 2);
  });
  it('in der Ebene des Rings nahe am Draht: großes Feld, auf dem Draht kein Wert', () => {
    expect(Math.abs(loopField(0.05, 1, 0.049, 0)[1])).toBeGreaterThan(loopCenterB(0.05, 1));
    expect(loopField(0.05, 1, 0.05, 0)).toEqual([0, 0]);
  });
});

describe('Magnetfeld: Spule', () => {
  it('Achse einer langen Spule: in der Mitte ≈ ideal, am Ende ≈ halb so groß', () => {
    const N = 500;
    const l = 0.5;
    const R = 0.02;
    expect(solenoidAxisB(N, 2, l, R, 0) / solenoidB(N, 2, l)).toBeCloseTo(1, 2);
    expect(solenoidAxisB(N, 2, l, R, l / 2) / solenoidB(N, 2, l)).toBeCloseTo(0.5, 2);
    expect(solenoidAxisB(N, 2, l, R, 2) / solenoidB(N, 2, l)).toBeLessThan(0.001);
  });
  it('kurze, dicke Spule: viel schwächer als die Formel für lange Spulen', () => {
    expect(solenoidAxisB(100, 1, 0.02, 0.05, 0) / solenoidB(100, 1, 0.02)).toBeCloseTo(0.02 / Math.hypot(0.02, 0.1), 6);
  });
  it('Summe der Ersatzwindungen ≈ Achsenformel', () => {
    const c = { N: 500, I: 2, l: 0.25, R: 0.03, loops: 80 };
    for (const z of [0, 0.06, 0.125, 0.2]) {
      const [bx, by] = coilField(c, z, 1e-6);
      expect(bx / solenoidAxisB(500, 2, 0.25, 0.03, z)).toBeCloseTo(1, 2);
      expect(Math.abs(by)).toBeLessThan(1e-6);
    }
  });
  it('Messreihe B(I) ist eine Ursprungsgerade', () => {
    const s = seriesBI(500, 0.25, 1, 3, 6);
    expect(s).toHaveLength(7);
    expect(s[0]).toEqual([0, 0]);
    for (const [I, B] of s.slice(1)) expect(B / I).toBeCloseTo(solenoidB(500, 1, 0.25), 12);
  });
});

describe('Magnetfeld: Relais', () => {
  it('zieht ab N·I = 60 A an, fällt erst unter 35 A ab (Hysterese)', () => {
    expect(relayState(RELAY, 0.1, false)).toBe(false); // 40 A
    expect(relayState(RELAY, 0.16, false)).toBe(true); // 64 A
    expect(relayState(RELAY, 0.1, true)).toBe(true); // 40 A ≥ 35 A
    expect(relayState(RELAY, 0.08, true)).toBe(false); // 32 A
  });
  it('Zugkraft wächst mit (N·I)² und bei kleinerem Luftspalt', () => {
    expect(relayForce(RELAY, 0.2, 1e-3) / relayForce(RELAY, 0.1, 1e-3)).toBeCloseTo(4, 12);
    expect(relayForce(RELAY, 0.2, 0.2e-3)).toBeGreaterThan(relayForce(RELAY, 0.2, 1e-3));
  });
});

describe('Magnetfeld: Elektromotor', () => {
  it('größtes Drehmoment N·B·I·A, im Totpunkt null', () => {
    expect(motorMaxTorque(MOTOR, 2)).toBeCloseTo(50 * 0.25 * 2 * 0.0012, 15);
    expect(motorTorque(MOTOR, 2, 0)).toBeCloseTo(0, 15);
    expect(motorTorque(MOTOR, 2, Math.PI / 2)).toBeCloseTo(motorMaxTorque(MOTOR, 2), 15);
  });
  it('mit Stromwender immer gleiche Drehrichtung, ohne pendelt der Läufer', () => {
    expect(motorTorque(MOTOR, 2, 4)).toBeGreaterThan(0);
    expect(motorTorque(MOTOR, 2, 4, false)).toBeLessThan(0);
    expect(commutatorSign(1)).toBe(1);
    expect(commutatorSign(4)).toBe(-1);
  });
  it('Motor läuft an und erreicht eine Enddrehzahl; ohne Stromwender keine Dauerdrehung', () => {
    let phi = 0.3;
    let w = 0;
    for (let i = 0; i < 200_000; i++) [phi, w] = motorStep(MOTOR, 2, phi, w, 1e-4);
    // mittleres Drehmoment 2/π · M_max = k · ω_end
    expect(w).toBeGreaterThan(0);
    expect(w).toBeCloseTo(((2 / Math.PI) * motorMaxTorque(MOTOR, 2)) / MOTOR.k, -1);
    let phi2 = 0.3;
    let w2 = 0;
    let maxPhi = 0;
    for (let i = 0; i < 100_000; i++) {
      [phi2, w2] = motorStep(MOTOR, 2, phi2, w2, 1e-4, false);
      maxPhi = Math.max(maxPhi, phi2);
    }
    expect(maxPhi).toBeLessThan(2 * Math.PI);
  });
});
