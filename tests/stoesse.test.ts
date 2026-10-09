import { describe, expect, it } from 'vitest';
import {
  approaching,
  balance,
  centerOfMassVelocity,
  collide,
  energyLoss,
  kineticEnergy,
  planRun,
  restitution,
  stateAt,
  TRACK,
} from '../src/simulations/physik/stoesse/model';

const CASES: [number, number, number, number][] = [
  [0.2, 0.5, 0.4, 0],
  [0.2, 0.5, 0.2, 0],
  [0.05, 0.5, 2, 0],
  [2, 0.5, 0.05, 0],
  [0.3, 0.8, 1.1, -0.6],
  [1, -0.2, 0.4, -0.9],
];

describe('Modell: Elastische und unelastische Stöße', () => {
  it('ordnet den Stoßarten die Stoßzahl zu', () => {
    expect(restitution('el', 0.3)).toBe(1);
    expect(restitution('inel', 0.3)).toBe(0);
    expect(restitution('part', 0.3)).toBe(0.3);
    expect(restitution('part', 1.7)).toBe(1);
  });

  it('erhält bei jeder Stoßzahl den Gesamtimpuls', () => {
    for (const [m1, v1, m2, v2] of CASES) {
      for (const k of [0, 0.25, 0.5, 0.8, 1]) {
        const w = collide(m1, v1, m2, v2, k);
        expect(m1 * w.v1 + m2 * w.v2).toBeCloseTo(m1 * v1 + m2 * v2, 12);
      }
    }
  });

  it('kehrt die Relativgeschwindigkeit mit dem Faktor k um', () => {
    for (const [m1, v1, m2, v2] of CASES) {
      for (const k of [0, 0.5, 1]) {
        const w = collide(m1, v1, m2, v2, k);
        expect(w.v2 - w.v1).toBeCloseTo(k * (v1 - v2), 12);
      }
    }
  });

  it('elastischer Stoß: Lehrbuchformel und Energieerhaltung', () => {
    // v₁' = ((m₁ − m₂)·v₁ + 2·m₂·v₂)/(m₁ + m₂)
    const w = collide(0.2, 0.5, 0.4, 0, 1);
    expect(w.v1).toBeCloseTo(-1 / 6, 12);
    expect(w.v2).toBeCloseTo(1 / 3, 12);
    for (const [m1, v1, m2, v2] of CASES) {
      const e = collide(m1, v1, m2, v2, 1);
      expect(kineticEnergy(m1, e.v1) + kineticEnergy(m2, e.v2)).toBeCloseTo(kineticEnergy(m1, v1) + kineticEnergy(m2, v2), 12);
      expect(energyLoss(m1, v1, m2, v2, 1)).toBe(0);
    }
  });

  it('gleiche Massen tauschen beim elastischen Stoß die Geschwindigkeiten', () => {
    const w = collide(0.2, 0.5, 0.2, -0.3, 1);
    expect(w.v1).toBeCloseTo(-0.3, 12);
    expect(w.v2).toBeCloseTo(0.5, 12);
  });

  it('vollkommen unelastisch: gemeinsame Geschwindigkeit = Schwerpunktsgeschwindigkeit', () => {
    const w = collide(0.2, 0.5, 0.2, 0, 0);
    expect(w.v1).toBeCloseTo(0.25, 12);
    expect(w.v2).toBeCloseTo(0.25, 12);
    expect(centerOfMassVelocity(0.2, 0.5, 0.2, 0)).toBeCloseTo(0.25, 12);
    // Die Hälfte der Bewegungsenergie wird in innere Energie umgewandelt
    expect(energyLoss(0.2, 0.5, 0.2, 0, 0)).toBeCloseTo(0.0125, 12);
  });

  it('Energiebilanz: vorher = nachher + innere Energie (auch teilelastisch)', () => {
    for (const [m1, v1, m2, v2] of CASES) {
      if (!approaching(v1, v2)) continue;
      for (const k of [0, 0.3, 0.7, 1]) {
        const run = planRun(m1, v1, m2, v2, k);
        const b = balance(run);
        expect(b.f1 + b.f2 + b.loss).toBeCloseTo(b.e1 + b.e2, 12);
        expect(b.loss).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('Ruhe nach dem Stoß, wenn der Gesamtimpuls null ist', () => {
    const w = collide(0.2, 0.5, 0.4, -0.25, 0);
    expect(w.v1).toBeCloseTo(0, 12);
    expect(w.v2).toBeCloseTo(0, 12);
    expect(energyLoss(0.2, 0.5, 0.4, -0.25, 0)).toBeCloseTo(kineticEnergy(0.2, 0.5) + kineticEnergy(0.4, -0.25), 12);
  });

  it('sehr schwerer Stoßpartner wirkt wie eine Wand', () => {
    const w = collide(0.05, 0.5, 1e6, 0, 1);
    expect(w.v1).toBeCloseTo(-0.5, 5);
    expect(w.v2).toBeCloseTo(0, 5);
    // … übernimmt aber fast den doppelten Impuls
    expect(1e6 * w.v2).toBeCloseTo(2 * 0.05 * 0.5, 5);
  });

  it('Ablauf: Gleiter berühren sich genau zur Stoßzeit und bleiben auf der Bahn', () => {
    for (const [m1, v1, m2, v2] of CASES) {
      for (const k of [0, 0.5, 1]) {
        const run = planRun(m1, v1, m2, v2, k);
        expect(run.collides).toBe(approaching(v1, v2));
        if (run.collides) {
          const c = stateAt(run, run.tc);
          expect(c.x2 - c.x1).toBeCloseTo(TRACK.glider, 12);
        }
        for (let i = 0; i <= 200; i++) {
          const s = stateAt(run, (run.tEnd * i) / 200);
          expect(s.x1 - TRACK.glider / 2).toBeGreaterThanOrEqual(TRACK.margin - 1e-9);
          expect(s.x2 + TRACK.glider / 2).toBeLessThanOrEqual(TRACK.length - TRACK.margin + 1e-9);
          // Die Gleiter durchdringen sich nie
          expect(s.x2 - s.x1).toBeGreaterThanOrEqual(TRACK.glider - 1e-9);
        }
      }
    }
  });

  it('der Schwerpunkt bewegt sich gleichförmig – auch über den Stoß hinweg', () => {
    const run = planRun(0.3, 0.8, 1.1, -0.6, 0.4);
    const s0 = stateAt(run, 0);
    for (const t of [0.1, run.tc * 0.9, run.tc, run.tc * 1.3, run.tEnd]) {
      const s = stateAt(run, t);
      expect(s.xs).toBeCloseTo(s0.xs + s0.vs * t, 12);
      expect(s.vs).toBeCloseTo(s0.vs, 12);
    }
  });

  it('kein Stoß, wenn Gleiter 1 nicht schneller nach rechts fährt als Gleiter 2', () => {
    const run = planRun(0.2, -0.3, 0.2, 0.4, 1);
    expect(run.collides).toBe(false);
    expect(run.tc).toBe(Infinity);
    expect(run.w1).toBe(-0.3);
    expect(balance(run).loss).toBe(0);
    expect(approaching(0.2, 0.2)).toBe(false);
  });
});
