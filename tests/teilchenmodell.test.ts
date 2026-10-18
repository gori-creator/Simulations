import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  diffusionFactor,
  enthalpy,
  GAS,
  kelvin,
  latentHeats,
  latticeSites,
  LIQUID,
  meanKineticEnergy,
  meanSpeed,
  modelKT,
  ParticleBox,
  phaseState,
  SAMPLE_MASS,
  SOLID,
  speedDensity,
  SwapLattice,
  swapRate,
  thermalSpeed,
  timeToMix,
  WATER,
  waterViscosity,
} from '../src/simulations/physik/teilchenmodell/model';

/** Heizt mit konstanter Leistung und misst, wie lange die Temperatur auf `theta` stehen bleibt. */
function plateau(theta: number, P: number, from: number, to: number): number {
  let H = enthalpy(from);
  const end = enthalpy(to);
  const h = 0.05;
  let time = 0;
  while (H < end) {
    const s = phaseState(H);
    if (Math.abs(s.theta - theta) < 1e-9 && (s.phase === 'melting' || s.phase === 'boiling')) time += h;
    H += P * h;
  }
  return time;
}

describe('Modell: Teilchenmodell – Wärmelehre im Großen', () => {
  it('Energie und Temperatur passen in allen Zuständen zusammen', () => {
    for (const theta of [-30, -12.5, 0, 0.5, 37, 99.5, 100, 100.5, 130]) {
      expect(phaseState(enthalpy(theta)).theta).toBeCloseTo(theta, 9);
    }
    expect(phaseState(enthalpy(-10)).phase).toBe('solid');
    expect(phaseState(enthalpy(50)).phase).toBe('liquid');
    expect(phaseState(enthalpy(120)).phase).toBe('gas');
  });

  it('Eis erwärmen: Q = m · c · Δϑ (0,5 kg von −20 °C auf 0 °C: 21 kJ)', () => {
    expect(enthalpy(0) - enthalpy(-20)).toBeCloseTo(0.5 * 2100 * 20, 6);
  });

  it('beim Schmelzen bleibt die Temperatur bei 0 °C: Dauer t = m · q_s / P', () => {
    const P = 1000;
    const t = plateau(0, P, -20, 50);
    expect(t).toBeCloseTo((SAMPLE_MASS * WATER.latentMelt) / P, 0); // 167 s
  });

  it('beim Sieden bleibt die Temperatur bei 100 °C: Dauer t = m · q_v / P', () => {
    const P = 1000;
    const t = plateau(100, P, 50, 130);
    expect(Math.abs(t - (SAMPLE_MASS * WATER.latentBoil) / P)).toBeLessThan(0.2); // 1128,5 s
  });

  it('während des Schmelzens wächst der flüssige Anteil gleichmäßig', () => {
    const { melt } = latentHeats();
    const s = phaseState(melt * 0.25);
    expect(s.phase).toBe('melting');
    expect(s.theta).toBe(0);
    expect(s.liquid).toBeCloseTo(0.25, 12);
    expect(s.solid + s.liquid + s.gas).toBeCloseTo(1, 12);
    const b = phaseState(enthalpy(100) + latentHeats().boil * 0.6);
    expect(b.phase).toBe('boiling');
    expect(b.gas).toBeCloseTo(0.6, 12);
  });

  it('Verdampfen braucht fast siebenmal so viel Energie wie Schmelzen', () => {
    const { melt, boil } = latentHeats();
    expect(boil / melt).toBeCloseTo(2257 / 334, 9);
    expect(boil / melt).toBeGreaterThan(6.7);
  });
});

describe('Modell: Teilchenmodell – Temperatur und Bewegungsenergie', () => {
  it('mittlere Bewegungsenergie ist proportional zur absoluten Temperatur', () => {
    expect(meanKineticEnergy(20)).toBeCloseTo(1.5 * 1.380649e-23 * 293.15, 30);
    expect(meanKineticEnergy(100) / meanKineticEnergy(0)).toBeCloseTo(373.15 / 273.15, 12);
    expect(meanKineticEnergy(-273.15)).toBe(0);
  });

  it('Wassermoleküle sind bei 20 °C im Mittel rund 590 m/s schnell', () => {
    expect(meanSpeed(20)).toBeGreaterThan(580);
    expect(meanSpeed(20)).toBeLessThan(595);
    expect(meanSpeed(100) / meanSpeed(0)).toBeCloseTo(Math.sqrt(kelvin(100) / kelvin(0)), 12);
  });

  it('Geschwindigkeitsverteilung: Fläche 1, Mittelwert wie vorgegeben', () => {
    const mean = 600;
    let area = 0;
    let first = 0;
    const dv = 0.5;
    for (let v = dv / 2; v < 6000; v += dv) {
      area += speedDensity(v, mean) * dv;
      first += v * speedDensity(v, mean) * dv;
    }
    expect(area).toBeCloseTo(1, 6);
    expect(first).toBeCloseTo(mean, 2);
  });

  it('Bildgeschwindigkeit wächst mit √T, Modell-kT proportional zu T', () => {
    expect(thermalSpeed(-273.15)).toBe(0);
    expect(modelKT(100) / modelKT(0)).toBeCloseTo(373.15 / 273.15, 12);
  });
});

/** Gas aus wenigen Teilchen in einem großen Gefäß. */
function gasBox(n: number, seed: number): ParticleBox {
  const rand = seededRandom(seed);
  const box = new ParticleBox(n, 20, 20, latticeSites(8, 8, 20), rand);
  box.ramp = false;
  box.arrange(0, n, modelKT(100));
  return box;
}

describe('Modell: Teilchenmodell – Teilchenbewegung', () => {
  it('ohne Thermostat bleibt die Energie bei Stößen erhalten', () => {
    const box = gasBox(30, 7);
    const e0 = box.totalEnergy();
    for (let s = 0; s < 4000; s++) box.step(1 / 300);
    expect(Math.abs(box.totalEnergy() - e0) / e0).toBeLessThan(0.01);
  });

  it('ein zentraler Stoß zweier gleicher Teilchen tauscht die Geschwindigkeiten (Impuls erhalten)', () => {
    const box = gasBox(2, 3);
    box.x.set([8, 12]);
    box.y.set([10, 10]);
    box.vx.set([3, -1]);
    box.vy.set([0, 0]);
    box.computeForces();
    const p0 = box.vx[0]! + box.vx[1]!;
    for (let s = 0; s < 900; s++) box.step(1 / 600);
    expect(box.vx[0]! + box.vx[1]!).toBeCloseTo(p0, 9);
    expect(box.vx[0]!).toBeCloseTo(-1, 2);
    expect(box.vx[1]!).toBeCloseTo(3, 2);
  });

  it('mit Thermostat: mittlere Bewegungsenergie der Teilchen ~ absolute Temperatur', () => {
    const mean = (theta: number, solid: number) => {
      const rand = seededRandom(11);
      const sites = latticeSites(10, 6, 14);
      const box = new ParticleBox(60, 14, 16, sites, rand);
      box.arrange(solid, 60 - solid, modelKT(theta));
      const kT = modelKT(theta);
      let sum = 0;
      let cnt = 0;
      for (let s = 0; s < 3000; s++) {
        box.step(1 / 300, { kT });
        if (s > 600) {
          sum += box.kinetic() / box.n;
          cnt++;
        }
      }
      return sum / cnt;
    };
    const cold = mean(-20, 60); // Eis
    const hot = mean(130, 0); // Dampf
    expect(hot / cold).toBeGreaterThan((kelvin(130) / kelvin(-20)) * 0.95);
    expect(hot / cold).toBeLessThan((kelvin(130) / kelvin(-20)) * 1.05);
  });

  it('Schmelzen beginnt oben am Rand, Erstarren unten in der Mitte; Verdampfen von der Oberfläche', () => {
    const rand = seededRandom(5);
    const sites = latticeSites(10, 6, 14);
    const box = new ParticleBox(60, 14, 16, sites, rand);
    box.arrange(60, 0, modelKT(0));
    // unterster Platz in der Mitte zuerst
    expect(sites[0]!.y).toBeLessThan(1);
    expect(Math.abs(sites[0]!.x - 7)).toBeLessThan(1);
    box.syncRoles(50, 0, modelKT(0));
    expect(box.count(SOLID)).toBe(50);
    expect(box.count(LIQUID)).toBe(10);
    // die zuletzt besetzten (obersten) Plätze sind frei geworden
    for (let k = 50; k < 60; k++) expect(box.owner[k]).toBe(-1);
    box.syncRoles(0, 0, modelKT(0));
    for (let s = 0; s < 1500; s++) box.step(1 / 300, { kT: modelKT(100) });
    const top = Math.max(...Array.from(box.y));
    const before = Array.from(box.y);
    box.syncRoles(0, 1, modelKT(100));
    expect(box.count(GAS)).toBe(1);
    const gi = Array.from(box.role).indexOf(GAS);
    expect(before[gi]).toBe(top);
    box.syncRoles(55, 0, modelKT(0));
    expect(box.count(SOLID)).toBe(55);
    expect(box.solidCount).toBe(55);
  });
});

describe('Modell: Teilchenmodell – Diffusion', () => {
  it('Viskosität von Wasser (Tabellenwerte)', () => {
    expect(waterViscosity(20) * 1000).toBeCloseTo(1.0, 1);
    expect(waterViscosity(10) * 1000).toBeCloseTo(1.31, 1);
    expect(waterViscosity(70) * 1000).toBeCloseTo(0.4, 1);
  });

  it('warmes Wasser: Diffusion deutlich schneller', () => {
    expect(diffusionFactor(20)).toBeCloseTo(1, 12);
    expect(diffusionFactor(70) / diffusionFactor(10)).toBeGreaterThan(3.5);
    expect(swapRate(70)).toBeGreaterThan(swapRate(10));
  });

  it('Tauschen erhält die Tinte, der Erwartungswert ihre Menge', () => {
    const lat = new SwapLattice(10, 12);
    lat.drop(5, 9, 40);
    expect(lat.mixing()).toBeCloseTo(0, 9);
    const rand = seededRandom(2);
    for (let s = 0; s < 500; s++) lat.swap(Math.floor(rand() * lat.bondCount));
    let ink = 0;
    for (let k = 0; k < lat.n; k++) ink += lat.ink[lat.at[k]!]!;
    expect(ink).toBe(40);
    lat.evolve(30, swapRate(20));
    const total = lat.field.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(40, 9);
    lat.evolve(600, swapRate(20));
    expect(lat.mixing()).toBeGreaterThan(0.99);
  });

  it('im warmen Wasser ist die Tinte schneller verteilt', () => {
    const cold = timeToMix(10, 12, 40, 10);
    const warm = timeToMix(10, 12, 40, 70);
    expect(warm).toBeLessThan(cold / 3);
  });
});
