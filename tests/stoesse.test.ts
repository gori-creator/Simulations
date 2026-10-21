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

  it('Werte aus dem Lernmaterial (Aufgaben 1–6) und der Prüfung', () => {
    // A1: Klettband, gleiche Massen → 0,25 m/s, 25 mJ → 12,5 mJ (50 %)
    let b = balance(planRun(0.2, 0.5, 0.2, 0, 0));
    expect(b.q1 / 0.2).toBeCloseTo(0.25, 12);
    expect((b.e1 + b.e2) * 1000).toBeCloseTo(25, 10);
    expect((b.f1 + b.f2) * 1000).toBeCloseTo(12.5, 10);
    // A2: elastisch 0,2/0,4 → −0,167 und 0,333 m/s; 2,78 + 22,22 = 25 mJ
    b = balance(planRun(0.2, 0.5, 0.4, 0, 1));
    expect(b.f1 * 1000).toBeCloseTo(2.778, 3);
    expect(b.f2 * 1000).toBeCloseTo(22.222, 3);
    // A3: Gesamtimpuls 0 bei v₂ = −0,25 m/s → 37,5 mJ in innere Energie
    b = balance(planRun(0.2, 0.5, 0.4, -0.25, 0));
    expect(b.loss * 1000).toBeCloseTo(37.5, 10);
    // A4: 0,05 kg gegen 2 kg → −0,476 und 0,024 m/s; p₂′ ≈ 0,049 kg·m/s; E₂′ ≈ 0,6 mJ
    const w4 = collide(0.05, 0.5, 2, 0, 1);
    expect(w4.v1).toBeCloseTo(-0.4756, 4);
    expect(w4.v2).toBeCloseTo(0.0244, 4);
    expect(2 * w4.v2).toBeCloseTo(0.0488, 4);
    expect(kineticEnergy(2, w4.v2) * 1000).toBeCloseTo(0.595, 3);
    // A5: k = 0,5, gleiche Massen → 0,125 und 0,375 m/s, 37,5 % umgewandelt
    const w5 = collide(0.2, 0.5, 0.2, 0, 0.5);
    expect(w5.v1).toBeCloseTo(0.125, 12);
    expect(w5.v2).toBeCloseTo(0.375, 12);
    expect(energyLoss(0.2, 0.5, 0.2, 0, 0.5) / kineticEnergy(0.2, 0.5)).toBeCloseTo(0.375, 12);
    // A6: gleiche Massen gegeneinander, elastisch → Tausch −0,3 und 0,5 m/s
    const w6 = collide(0.2, 0.5, 0.2, -0.3, 1);
    expect(w6.v1).toBeCloseTo(-0.3, 12);
    expect(w6.v2).toBeCloseTo(0.5, 12);
    // Beispiel t-x: k = 0,5, m₂ = 0,6 kg, v₂ = −0,4 m/s → v_S = −0,175; −0,5125 und −0,0625 m/s; 73 → 27,44 mJ
    const run = planRun(0.2, 0.5, 0.6, -0.4, 0.5);
    expect(stateAt(run, 0).vs).toBeCloseTo(-0.175, 12);
    expect(run.w1).toBeCloseTo(-0.5125, 12);
    expect(run.w2).toBeCloseTo(-0.0625, 12);
    b = balance(run);
    expect((b.e1 + b.e2) * 1000).toBeCloseTo(73, 10);
    expect((b.f1 + b.f2) * 1000).toBeCloseTo(27.4375, 10);
  });

  it('Reglergrenzen: Gleiter bleiben auf der Bahn, Bilanz stimmt', () => {
    const masses = [0.05, 0.2, 2];
    const speeds = [-1, -0.05, 0, 0.05, 1];
    for (const m1 of masses)
      for (const m2 of masses)
        for (const v1 of speeds)
          for (const v2 of speeds)
            for (const k of [0, 0.05, 1]) {
              const run = planRun(m1, v1, m2, v2, k);
              expect(Number.isFinite(run.tEnd)).toBe(true);
              expect(run.tEnd).toBeGreaterThan(0);
              for (let i = 0; i <= 50; i++) {
                const s = stateAt(run, (run.tEnd * i) / 50);
                expect(s.x1 - TRACK.glider / 2).toBeGreaterThanOrEqual(TRACK.margin - 1e-9);
                expect(s.x2 + TRACK.glider / 2).toBeLessThanOrEqual(TRACK.length - TRACK.margin + 1e-9);
                expect(s.x2 - s.x1).toBeGreaterThanOrEqual(TRACK.glider - 1e-9);
              }
              const b = balance(run);
              expect(b.q1 + b.q2).toBeCloseTo(b.p1 + b.p2, 12);
              expect(b.f1 + b.f2 + b.loss).toBeCloseTo(b.e1 + b.e2, 12);
            }
  });

  it('Sonderfälle: beide in Ruhe, gleich schnell, schwerer trifft leichten', () => {
    // beide ruhen bzw. fahren gleich schnell → kein Stoß, keine Division durch 0
    for (const v of [0, 0.4, -0.4]) {
      const run = planRun(0.2, v, 0.4, v, 1);
      expect(run.collides).toBe(false);
      expect(Number.isFinite(run.x1) && Number.isFinite(run.x2)).toBe(true);
    }
    // Schwer (2 kg) trifft leicht (0,05 kg) elastisch: schwerer fährt fast unverändert weiter, leichter mit fast 2·v₁
    const w = collide(2, 0.5, 0.05, 0, 1);
    expect(w.v1).toBeCloseTo((1.95 * 0.5) / 2.05, 12);
    expect(w.v2).toBeCloseTo((2 * 2 * 0.5) / 2.05, 12);
    expect(w.v2).toBeLessThan(1);
    expect(w.v2).toBeGreaterThan(0.97);
  });
});
