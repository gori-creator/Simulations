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
  THERMOSTAT,
  thermostatOptions,
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

describe('Modell: Teilchenmodell – Werte aus Lernmaterial und Anzeigen', () => {
  it('Celsius → Kelvin (Aufgabe 1) und absoluter Nullpunkt', () => {
    expect(kelvin(20)).toBeCloseTo(293.15, 12);
    expect(kelvin(-20)).toBeCloseTo(253.15, 12);
    expect(kelvin(100)).toBeCloseTo(373.15, 12);
    expect(kelvin(-273.15)).toBe(0);
    // Bewegungsenergie bei 100 °C rund 27 % größer als bei 20 °C (nicht fünfmal so groß)
    expect(meanKineticEnergy(100) / meanKineticEnergy(20)).toBeCloseTo(1.273, 3);
    // unter 0 K wird nichts negativ
    expect(meanSpeed(-300)).toBe(0);
    expect(meanKineticEnergy(-300)).toBe(0);
  });

  it('Anzeige „Temperatur und Teilchenbewegung“: 6,07 · 10⁻²¹ J und rund 590 m/s bei 20 °C', () => {
    expect(meanKineticEnergy(20) * 1e21).toBeCloseTo(6.07, 2);
    expect(Math.round(meanSpeed(20) / 10) * 10).toBe(590);
    expect(Math.round(meanSpeed(-20) / 10) * 10).toBe(550);
    expect(Math.round(meanSpeed(100) / 10) * 10).toBe(660);
  });

  it('Schmelzen und Verdampfen (Aufgaben 2 und 3): 167 kJ, 1128,5 kJ, 334 s bei 500 W', () => {
    const { melt, boil } = latentHeats();
    expect(melt).toBeCloseTo(167000, 6);
    expect(boil).toBeCloseTo(1128500, 6);
    expect(melt / 500).toBeCloseTo(334, 9);
    expect(boil / melt).toBeCloseTo(6.76, 2);
    // Eis von −20 °C bis zum Sieden bei 1000 W: 21 kJ + 167 kJ + 209,5 kJ → 397,5 s ≈ 6,6 min
    expect((enthalpy(100) - enthalpy(-20)) / 1000).toBeCloseTo(397.5, 9);
  });

  it('Phasenübergang genau an den Grenzen: 0 °C fest, 100 °C flüssig, halbe Schmelzwärme = halb geschmolzen', () => {
    expect(phaseState(enthalpy(0)).phase).toBe('solid');
    expect(phaseState(enthalpy(100)).phase).toBe('liquid');
    const half = phaseState(latentHeats().melt / 2);
    expect(half.theta).toBe(0);
    expect(half.liquid).toBeCloseTo(0.5, 12);
  });

  it('Diffusion bei 10 °C und 70 °C: Teilchen tauschen rund 3,9-mal so oft die Plätze', () => {
    expect(diffusionFactor(70) / diffusionFactor(10)).toBeCloseTo(3.93, 2);
    expect(Math.round(meanSpeed(10) / 10) * 10).toBe(580);
    expect(Math.round(meanSpeed(70) / 10) * 10).toBe(640);
  });
});

describe('Prüfrunde: Thermostat beim Zustandswechsel', () => {
  it('regelt beim Schmelzen und Sieden (und kurz danach) straffer, sonst wie bisher', () => {
    const kT = modelKT(0);
    expect(thermostatOptions('solid', kT)).toEqual({ kT, tau: 0.35, shuffle: 0.35 });
    expect(thermostatOptions('liquid', kT)).toEqual({ kT, tau: 0.35, shuffle: 0.35 });
    expect(thermostatOptions('gas', kT)).toEqual({ kT, tau: 0.35, shuffle: 0.35 });
    for (const ph of ['melting', 'boiling'] as const) {
      const o = thermostatOptions(ph, kT);
      expect(o.tau).toBe(THERMOSTAT.tauTransition);
      expect(o.tau!).toBeLessThan(0.35 / 5);
      expect(o.shuffle!).toBeGreaterThan(0.35);
    }
    expect(thermostatOptions('solid', kT, 0.5).tau).toBe(THERMOSTAT.tauTransition);
    expect(thermostatOptions('solid', kT, THERMOSTAT.hold + 0.01).tau).toBe(0.35);
  });

  it('schnelles Schmelzen (1000 W, ≈ 4,2 s im Bild): mittlere Geschwindigkeit bleibt höchstens ≈ 3 % neben dem Wert bei 0 °C', () => {
    for (const seed of [1, 2, 3]) {
      const box = new ParticleBox(60, 14, 16, latticeSites(10, 6, 14), seededRandom(seed));
      const kT = modelKT(0);
      box.arrange(60, 0, kT);
      const mean = () => {
        let sum = 0;
        for (let i = 0; i < box.n; i++) sum += Math.hypot(box.vx[i]!, box.vy[i]!);
        return sum / box.n;
      };
      // Eis bei 0 °C einschwingen lassen, dann Bezugswert messen
      for (let s = 0; s < 900; s++) box.step(1 / 300, thermostatOptions('solid', kT));
      let ref = 0;
      for (let s = 0; s < 900; s++) {
        box.step(1 / 300, thermostatOptions('solid', kT));
        ref += mean() / 900;
      }
      // wie in der Simulation: 60 Bilder/s, je 5 Schritte, gleitender Mittelwert wie im Histogramm
      const frames = Math.round(4.2 * 60);
      let shown = ref;
      let worst = 0;
      for (let f = 0; f < frames; f++) {
        box.syncRoles(Math.round((1 - (f + 1) / frames) * 60), 0, kT);
        for (let k = 0; k < 5; k++) box.step(1 / 300, thermostatOptions('melting', kT));
        shown += (mean() - shown) * (1 - Math.exp(-1.2 / 60));
        worst = Math.max(worst, Math.abs(shown / ref - 1));
      }
      expect(box.count(LIQUID)).toBe(60);
      expect(worst).toBeLessThan(0.035);
    }
  });
});
