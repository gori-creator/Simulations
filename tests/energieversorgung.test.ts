import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  balanceError,
  battery,
  chainEfficiency,
  co2Kg,
  current,
  duration,
  efficiency,
  energy,
  heightFor,
  householdsYear,
  lineLoss,
  load,
  lossRatio,
  outputPower,
  PLANT_IDS,
  PLANTS,
  plantChain,
  potentialEnergy,
  pumpStorage,
  simulateDay,
  solar,
  stepAt,
  STORE_ETA,
  toMWh,
  transformer,
  transmit,
  waterMass,
  windPower,
} from '../src/simulations/physik/energieversorgung/model';

describe('Modell: Energieversorgung – Grundformeln', () => {
  it('E = P · t: 1 kW über 3 h → 3 kWh', () => {
    expect(energy(1, 3)).toBe(3);
    expect(energy(2.5, 4)).toBe(10);
    expect(energy(0, 24)).toBe(0);
  });

  it('η = P_ab / P_zu: 40 % von 100 MW Wärme → 40 MW elektrisch', () => {
    expect(outputPower(100, 0.4)).toBeCloseTo(40, 12);
    expect(efficiency(40, 100)).toBeCloseTo(0.4, 12);
    expect(efficiency(5, 0)).toBe(0);
    expect(chainEfficiency([0.9, 0.5])).toBeCloseTo(0.45, 12);
    expect(chainEfficiency([])).toBe(1);
  });

  it('CO₂ und Haushalte: 1000 kWh bei 820 g/kWh → 820 kg; 3500 kWh → 1 Haushalt', () => {
    expect(co2Kg(1000, 820)).toBeCloseTo(820, 12);
    expect(householdsYear(3500)).toBeCloseTo(1, 12);
    expect(householdsYear(7e6)).toBeCloseTo(2000, 9);
  });
});

describe('Modell: Energieversorgung – Kraftwerke', () => {
  it('Kohlekraftwerk: rund 40 % (0,9 · 0,47 · 0,98 · 0,96 = 0,398)', () => {
    const c = plantChain('kohle', 1000);
    expect(c.eta).toBeCloseTo(0.9 * 0.47 * 0.98 * 0.96, 12);
    expect(c.eta).toBeCloseTo(0.398, 3);
    expect(c.pel).toBeCloseTo(397.96, 2);
    // Größter Verlust an der Dampfturbine: 900 MW · 0,53 = 477 MW
    expect(c.steps[1]!.loss).toBeCloseTo(477, 9);
  });

  it('Wirkungsgrade in plausibler Reihenfolge (Wasser > GuD > Wind > Kohle > Biogas > Kern > PV)', () => {
    const eta = (id: (typeof PLANT_IDS)[number]) => plantChain(id, 100).eta;
    expect(eta('wasser')).toBeGreaterThan(eta('gas'));
    expect(eta('gas')).toBeGreaterThan(eta('wind'));
    expect(eta('wind')).toBeGreaterThan(eta('kohle'));
    expect(eta('kohle')).toBeGreaterThan(eta('bio'));
    expect(eta('bio')).toBeGreaterThan(eta('kern'));
    expect(eta('kern')).toBeGreaterThan(eta('pv'));
    expect(eta('gas')).toBeCloseTo(0.58, 2);
    expect(eta('pv')).toBeCloseTo(0.2, 2);
    // Betz-Grenze: Der Rotor nutzt höchstens 16/27 ≈ 59 % der Windleistung
    expect(PLANTS.wind.stages[0]!.eta).toBeLessThan(16 / 27);
  });

  it('Regenerativ/erschöpfbar und CO₂-Beispielwerte', () => {
    const renew = PLANT_IDS.filter((id) => PLANTS[id].renewable);
    expect(renew).toEqual(['wind', 'pv', 'wasser', 'bio']);
    expect(PLANTS.kohle.co2).toBeGreaterThan(PLANTS.gas.co2);
    expect(PLANTS.gas.co2).toBeGreaterThan(PLANTS.bio.co2);
    for (const id of ['kern', 'wind', 'pv', 'wasser'] as const) expect(PLANTS[id].co2).toBeLessThan(50);
  });

  it('Kraft-Wärme-Kopplung: Strom bleibt gleich, Nutzungsgrad steigt (GuD ≈ 80 %)', () => {
    const a = plantChain('gas', 500);
    const b = plantChain('gas', 500, true);
    expect(b.pel).toBeCloseTo(a.pel, 12);
    expect(b.heat).toBeCloseTo(500 * 0.97 * 0.38 * 0.6, 9);
    expect(b.usage).toBeCloseTo(0.8016, 3);
    expect(a.heat).toBe(0);
    expect(plantChain('kern', 500, true).heat).toBe(0);
    expect(plantChain('wind', 500, true).heat).toBe(0);
  });

  it('Zufallsprüfung: Summe der Verluste + Nutzenergie = zugeführte Energie', () => {
    const rnd = seededRandom(42);
    for (let k = 0; k < 400; k++) {
      const id = PLANT_IDS[Math.floor(rnd() * PLANT_IDS.length)]!;
      const pin = 1 + rnd() * 3000;
      const chp = rnd() < 0.5;
      const c = plantChain(id, pin, chp);
      const losses = c.steps.reduce((s, q) => s + q.loss, 0);
      expect(losses + c.pel).toBeCloseTo(pin, 8);
      expect(c.lost + c.heat + c.pel).toBeCloseTo(pin, 8);
      for (const s of c.steps) {
        expect(s.pout + s.loss).toBeCloseTo(s.pin, 9);
        expect(s.heat).toBeLessThanOrEqual(s.loss + 1e-9);
      }
      expect(c.eta).toBeGreaterThan(0);
      expect(c.eta).toBeLessThan(1);
      expect(c.usage).toBeGreaterThanOrEqual(c.eta);
    }
  });
});

describe('Modell: Energieversorgung – Strommix über den Tag', () => {
  it('Last: nachts niedriger als mittags, im Winter höher als im Sommer', () => {
    expect(load(3, 'sommer')).toBeLessThan(load(12, 'sommer'));
    expect(load(3, 'winter')).toBeLessThan(load(18, 'winter'));
    expect(load(12, 'winter')).toBeGreaterThan(load(12, 'sommer'));
    expect(load(3, 'sommer')).toBeGreaterThan(40);
    expect(load(18, 'winter')).toBeLessThan(85);
  });

  it('Sonne: nachts 0, mittags am meisten, im Sommer mehr als im Winter', () => {
    expect(solar(2, 'sommer', 1)).toBe(0);
    expect(solar(23, 'sommer', 1)).toBe(0);
    expect(solar(7, 'winter', 1)).toBe(0);
    expect(solar(13.3, 'sommer', 1)).toBeGreaterThan(solar(9, 'sommer', 1));
    expect(solar(12.3, 'sommer', 1)).toBeGreaterThan(2 * solar(12.3, 'winter', 1));
    expect(solar(13, 'sommer', 0.5)).toBeCloseTo(solar(13, 'sommer', 1) / 2, 12);
    expect(windPower(10, 'winter', 0)).toBe(0);
    expect(windPower(10, 'winter', 1)).toBeLessThanOrEqual(70 * 0.92 + 1e-9);
  });

  it('Bilanz in jedem Schritt: Erzeugung + Entladen + Gas − Laden − Überschuss = Last', () => {
    const rnd = seededRandom(7);
    for (let k = 0; k < 60; k++) {
      const day = simulateDay({ season: rnd() < 0.5 ? 'sommer' : 'winter', sun: rnd(), wind: rnd(), base: rnd() * 20, cap: rnd() * 80, power: rnd() * 20, soc0: rnd() });
      for (const st of day.steps) {
        expect(Math.abs(balanceError(st))).toBeLessThan(1e-9);
        expect(st.gas).toBeGreaterThanOrEqual(-1e-12);
        expect(st.charge).toBeGreaterThanOrEqual(0);
        expect(st.surplus).toBeGreaterThanOrEqual(-1e-12);
        // Laden und Entladen nie gleichzeitig, Gas nur bei Defizit
        expect(st.charge * st.discharge).toBe(0);
        expect(st.gas * st.surplus).toBe(0);
      }
      const t = day.totals;
      expect(t.pv + t.wind + t.hydro + t.bio + t.coal + t.discharge + t.gas - t.charge - t.surplus).toBeCloseTo(t.load, 6);
      expect(day.renewShare).toBeGreaterThanOrEqual(0);
      expect(day.renewShare).toBeLessThanOrEqual(1);
    }
  });

  it('Speicher: Füllstand bleibt zwischen 0 und Kapazität, Energiebilanz mit Wirkungsgrad', () => {
    const prm = { season: 'sommer' as const, sun: 1, wind: 0.3, base: 8, cap: 40, power: 10, soc0: 0.5 };
    const day = simulateDay(prm);
    for (const st of day.steps) {
      expect(st.soc).toBeGreaterThanOrEqual(-1e-9);
      expect(st.soc).toBeLessThanOrEqual(prm.cap + 1e-9);
      expect(st.charge).toBeLessThanOrEqual(prm.power + 1e-12);
      expect(st.discharge).toBeLessThanOrEqual(prm.power + 1e-12);
    }
    const end = day.steps[day.steps.length - 1]!.soc;
    const expected = 0.5 * prm.cap + day.totals.charge * STORE_ETA - day.totals.discharge / STORE_ETA;
    expect(end).toBeCloseTo(expected, 6);
    // Sonniger Sommertag: mittags Überschuss, der Speicher wird geladen
    expect(day.totals.charge).toBeGreaterThan(0);
    expect(stepAt(day, 13).gas).toBe(0);
  });

  it('Windstille Winternacht: Gaskraftwerke tragen die Last; Sturm: viel Wind, wenig Gas', () => {
    const calm = simulateDay({ season: 'winter', sun: 0.2, wind: 0.05, base: 8, cap: 40, power: 10 });
    const storm = simulateDay({ season: 'winter', sun: 0.2, wind: 0.95, base: 8, cap: 40, power: 10 });
    expect(calm.totals.gas).toBeGreaterThan(storm.totals.gas * 3);
    expect(calm.gasPeak).toBeGreaterThan(40);
    expect(storm.renewShare).toBeGreaterThan(calm.renewShare + 0.4);
    expect(calm.intensity).toBeGreaterThan(storm.intensity);
    // Ohne Speicher wird nichts geladen oder entladen
    const none = simulateDay({ season: 'sommer', sun: 1, wind: 0.5, base: 8, cap: 0, power: 10 });
    expect(none.totals.charge + none.totals.discharge).toBe(0);
  });
});

describe('Modell: Energieversorgung – Speicher', () => {
  it('Pumpspeicher: 1 Mio. m³ Wasser, 300 m → E = m · g · h ≈ 817,5 MWh', () => {
    expect(waterMass(1e6)).toBe(1e9);
    // 10⁹ kg · 9,81 m/s² · 300 m = 2,943 · 10¹² J; : 3,6 · 10⁹ J/MWh = 817,5 MWh
    expect(potentialEnergy(1e9, 300)).toBeCloseTo(2.943e12, 0);
    expect(toMWh(2.943e12)).toBeCloseTo(817.5, 6);
    const s = pumpStorage(1, 300);
    expect(s.mwh).toBeCloseTo(817.5, 6);
    expect(s.outMWh).toBeLessThan(s.mwh);
    expect(s.inMWh).toBeGreaterThan(s.mwh);
    expect(s.outMWh / s.inMWh).toBeCloseTo(s.roundTrip, 12);
    expect(s.roundTrip).toBeCloseTo(0.7569, 4);
    // Lehrbuch: 1 kg in 1 m Höhe speichert 9,81 J
    expect(potentialEnergy(1, 1)).toBeCloseTo(9.81, 12);
  });

  it('Lade- und Entladezeit t = E / P: 817,5 MWh bei 300 MW → 2,725 h', () => {
    expect(duration(817.5, 300)).toBeCloseTo(2.725, 12);
    expect(duration(100, 0)).toBe(Infinity);
    expect(heightFor(817.5, 1)).toBeCloseTo(300, 9);
  });

  it('Batterie: 100 MWh, Wirkungsgrad hin und zurück ≈ 90 %', () => {
    const b = battery(100);
    expect(b.outMWh).toBeCloseTo(95, 12);
    expect(b.inMWh).toBeCloseTo(105.263, 3);
    expect(b.roundTrip).toBeCloseTo(0.9025, 12);
    expect(duration(b.mwh, 50)).toBe(2);
  });
});

describe('Modell: Energieversorgung – Übertragung', () => {
  it('I = P / U: 100 MW bei 110 kV → 909 A, bei 380 kV → 263 A', () => {
    expect(current(100e6, 110e3)).toBeCloseTo(909.09, 2);
    expect(current(100e6, 380e3)).toBeCloseTo(263.16, 2);
    expect(lineLoss(10, 2)).toBe(200);
  });

  it('Verluste P_V = I² · R bei R = 10 Ω: 8,26 MW (110 kV) gegen 0,69 MW (380 kV)', () => {
    const a = transmit(100, 110, 100);
    const b = transmit(100, 380, 100);
    expect(a.r).toBeCloseTo(10, 12);
    expect(a.loss).toBeCloseTo(8.2645, 4);
    expect(b.loss).toBeCloseTo(0.69252, 5);
    expect(a.share).toBeCloseTo(0.082645, 6);
    expect(a.arrive).toBeCloseTo(100 - 8.2645, 4);
    expect(a.drop).toBeCloseTo(9.0909, 4);
    expect(a.loss / b.loss).toBeCloseTo(lossRatio(110, 380), 9);
    expect(lossRatio(110, 380)).toBeCloseTo(11.934, 3);
  });

  it('Verluste ∝ 1/U² und ∝ P² und ∝ Länge (Zufallsprüfung)', () => {
    const rnd = seededRandom(3);
    for (let k = 0; k < 200; k++) {
      const p = 10 + rnd() * 900;
      const u = 10 + rnd() * 390;
      const len = 10 + rnd() * 490;
      const t = transmit(p, u, len);
      expect(transmit(p, 2 * u, len).loss).toBeCloseTo(t.loss / 4, 9);
      expect(transmit(2 * p, u, len).loss).toBeCloseTo(t.loss * 4, 6);
      expect(transmit(p, u, 2 * len).loss).toBeCloseTo(t.loss * 2, 6);
      expect(t.arrive).toBeGreaterThanOrEqual(0);
    }
  });

  it('Sonderfall: sehr kleine Spannung – der Verlust übersteigt die Leistung, nichts kommt an', () => {
    const t = transmit(100, 10, 100);
    // I = 10 000 A, P_V = 10⁸ · 10 Ω = 1000 MW > 100 MW
    expect(t.current).toBeCloseTo(10000, 9);
    expect(t.loss).toBeCloseTo(1000, 9);
    expect(t.arrive).toBe(0);
  });

  it('Idealer Transformator: 1 : 20 → Spannung × 20, Strom : 20 (Leistung bleibt gleich)', () => {
    const t = transformer(19, 5000, 1, 20);
    expect(t.u2).toBeCloseTo(380, 12);
    expect(t.i2).toBeCloseTo(250, 12);
    expect(t.u2 * t.i2).toBeCloseTo(19 * 5000, 9);
  });
});
