import { describe, expect, it } from 'vitest';
import {
  airDensity,
  apparentWeight,
  balloonEquipment,
  balloonForces,
  box,
  buoyancy,
  capsule,
  cm3,
  cube,
  cylinderReading,
  density,
  displacedInCylinder,
  equilibriumAltitude,
  equilibriumDepth,
  floatState,
  G,
  hoverFill,
  identify,
  immersedFraction,
  KELVIN,
  liftOffTemperature,
  LIQUID_DENSITY,
  MATERIAL_DENSITY,
  MATERIALS,
  massOf,
  meterRange,
  P0,
  pressureAt,
  scaleHeight,
  shipInflow,
  SHIP_INNER,
  shipState,
  SHIP,
  sloshOmega,
  steelVolume,
  stepBalloon,
  stepBody,
  stepOverflow,
  subMass,
  subShape,
  SUB,
  tankLevel,
  toSI,
  weight,
  bodyForces,
  type Motion,
  type Overflow,
} from '../src/simulations/physik/dichte-auftrieb/model';

const WATER = toSI(LIQUID_DENSITY.fresh);

describe('Modell: Dichte und Auftrieb – Grundgesetze', () => {
  it('Holzklotz 10 cm³, ρ = 0,6 g/cm³, taucht in Wasser zu 60 % ein', () => {
    expect(immersedFraction(0.6, 1.0)).toBeCloseTo(0.6, 12);
    const shape = cube(cm3(10));
    const m = massOf(0.6, 10) / 1000; // 6 g
    const d = equilibriumDepth(shape, m, WATER)!;
    expect(d / shape.height).toBeCloseTo(0.6, 9);
    expect(shape.submerged(d) / shape.volume).toBeCloseTo(0.6, 9);
  });

  it('Auftrieb eines 100-cm³-Körpers ganz in Wasser ≈ 0,981 N', () => {
    expect(buoyancy(WATER, cm3(100))).toBeCloseTo(0.981, 12);
  });

  it('ρ = m/V und F_G = m·g', () => {
    expect(density(81, 30)).toBeCloseTo(2.7, 12); // Aluminium
    expect(weight(0.1)).toBeCloseTo(0.981, 12);
    expect(massOf(7.87, 100)).toBeCloseTo(787, 9);
  });

  it('Eisen (7,87 g/cm³) sinkt; scheinbares Gewicht im Wasser', () => {
    expect(floatState(MATERIAL_DENSITY.iron, LIQUID_DENSITY.fresh)).toBe('sink');
    expect(equilibriumDepth(cube(cm3(100)), 0.787, WATER)).toBeNull();
    // 100 cm³ Eisen: F_G = 0,787 kg · 9,81 N/kg = 7,720 N, im Wasser 7,720 N − 0,981 N = 6,739 N
    expect(weight(0.787)).toBeCloseTo(7.72047, 5);
    expect(apparentWeight(0.787, cm3(100), WATER)).toBeCloseTo(6.73947, 5);
  });

  it('Eis in Wasser: 91,7 % unter der Oberfläche', () => {
    expect(immersedFraction(MATERIAL_DENSITY.ice, LIQUID_DENSITY.fresh)).toBeCloseTo(0.917, 12);
    const shape = cube(cm3(1000));
    const d = equilibriumDepth(shape, 0.917, WATER)!;
    expect(d / shape.height).toBeCloseTo(0.917, 9);
  });

  it('Salzwasser 1,025 g/cm³: dasselbe Holz taucht weniger tief ein', () => {
    expect(LIQUID_DENSITY.salt).toBe(1.025);
    expect(immersedFraction(0.6, 1.025)).toBeCloseTo(0.585366, 6);
    expect(immersedFraction(0.6, 1.025)).toBeLessThan(immersedFraction(0.6, 1.0));
  });

  it('Grenzfall ρ_K = ρ_Fl → Schweben', () => {
    expect(floatState(1.0, 1.0)).toBe('hover');
    expect(floatState(0.99, 1.0)).toBe('float');
    expect(floatState(1.01, 1.0)).toBe('sink');
    expect(immersedFraction(1.0, 1.0)).toBe(1);
    expect(equilibriumDepth(cube(cm3(100)), 0.1, WATER)).toBeCloseTo(cube(cm3(100)).height, 12);
  });

  it('Blei schwimmt auf Quecksilber, Gold nicht', () => {
    expect(floatState(MATERIAL_DENSITY.lead, LIQUID_DENSITY.mercury)).toBe('float');
    expect(floatState(MATERIAL_DENSITY.gold, LIQUID_DENSITY.mercury)).toBe('sink');
    expect(immersedFraction(MATERIAL_DENSITY.iron, LIQUID_DENSITY.mercury)).toBeCloseTo(0.5808, 4);
  });

  it('Stofftabelle ist nach Dichte sortiert, Zuordnung zum nächsten Stoff', () => {
    for (let i = 1; i < MATERIALS.length; i++) expect(MATERIAL_DENSITY[MATERIALS[i]!]).toBeGreaterThan(MATERIAL_DENSITY[MATERIALS[i - 1]!]);
    expect(identify(2.71)).toBe('alu');
    expect(identify(7.9)).toBe('iron');
    expect(identify(0.58)).toBe('wood');
    expect(identify(19)).toBe('gold');
  });

  it('Kraftmesser: kleinster passender Messbereich', () => {
    expect(meterRange(0.981)).toBe(1);
    expect(meterRange(1.2)).toBe(2);
    expect(meterRange(7.72)).toBe(10);
    expect(meterRange(10)).toBe(10);
  });
});

describe('Modell: Formen', () => {
  it('Kugelkappe und Kreisabschnitt: Grenzwerte', () => {
    const c = capsule(0.035, 0.1);
    expect(c.submerged(0)).toBe(0);
    expect(c.submerged(0.07)).toBeCloseTo(c.volume, 12);
    expect(c.submerged(0.035)).toBeCloseTo(c.volume / 2, 12);
  });

  it('Kapsel: Wasserlinienfläche ist die Ableitung des eingetauchten Volumens', () => {
    const c = capsule(0.035, 0.1);
    for (const d of [0.005, 0.02, 0.035, 0.06]) {
      const e = 1e-6;
      expect((c.submerged(d + e) - c.submerged(d - e)) / (2 * e)).toBeCloseTo(c.waterplane(d), 6);
    }
  });

  it('Quader: eingetauchtes Volumen', () => {
    const b = box(0.2, 0.1, 0.06);
    expect(b.volume).toBeCloseTo(1.2e-3, 15);
    expect(b.submerged(0.03)).toBeCloseTo(6e-4, 15);
    expect(b.submerged(1)).toBeCloseTo(1.2e-3, 15);
  });
});

describe('Modell: Becken und Bewegung', () => {
  const tank = { area: 0.06, liquid: 0.06 * 0.18, rho: WATER };

  it('Wasserstand steigt um V_verdrängt / A', () => {
    const shape = cube(cm3(1000));
    // ganz eingetaucht am Boden: +1000 cm³ / 600 cm² = 1,667 cm
    expect(tankLevel(tank.liquid, tank.area, shape, 0)).toBeCloseTo(0.18 + 1e-3 / 0.06, 9);
    // weit über dem Wasser: unverändert
    expect(tankLevel(tank.liquid, tank.area, shape, 0.5)).toBeCloseTo(0.18, 9);
  });

  it('Zufallsprüfung: ein schwimmender Körper kommt mit F_A = F_G zur Ruhe', () => {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 12; k++) {
      const V = cm3(20 + rand() * 900);
      const rhoFl = toSI([0.79, 0.92, 1, 1.025, 1.24][k % 5]!);
      const rhoK = rhoFl * (0.05 + 0.9 * rand());
      const body = { massKg: rhoK * V, shape: cube(V) };
      const t = { ...tank, rho: rhoFl };
      let m: Motion = { z: 0.2, v: 0 };
      for (let i = 0; i < 40000; i++) m = stepBody(body, t, m, 0.0005);
      const f = bodyForces(body, t, m.z);
      expect(Math.abs(f.FA - f.FG) / f.FG).toBeLessThan(1e-3);
      expect(f.displaced / V).toBeCloseTo(rhoK / rhoFl, 3);
      expect(Math.abs(m.v)).toBeLessThan(1e-3);
    }
  });

  it('Ein sinkender Körper liegt am Ende auf dem Boden', () => {
    const V = cm3(125);
    const body = { massKg: 7870 * V, shape: cube(V) };
    let m: Motion = { z: 0.15, v: 0 };
    for (let i = 0; i < 8000; i++) m = stepBody(body, tank, m, 0.0005);
    expect(m.z).toBe(0);
  });

  it('Stehende Wellen: Tiefwasser- und Flachwassergrenze', () => {
    const W = 0.4;
    const k = Math.PI / W;
    expect(sloshOmega(1, W, 100)).toBeCloseTo(Math.sqrt(G * k), 6);
    expect(sloshOmega(1, W, 1e-4) / (k * Math.sqrt(G * 1e-4))).toBeCloseTo(1, 4);
  });
});

describe('Modell: Schiff und U-Boot', () => {
  it('Stahlschiff schwimmt, derselbe Stahl als Klumpen sinkt', () => {
    expect(steelVolume() * 1e6).toBeCloseTo(38.12, 2);
    expect(floatState(7870, WATER)).toBe('sink');
    const s = shipState(0, WATER);
    expect(s.meanDensity).toBeCloseTo(250, 9); // 0,3 kg / 1,2 dm³
    expect(s.draught).toBeCloseTo(0.015, 9); // 300 g / (20 cm · 10 cm) = 1,5 cm
  });

  it('Schiff im Meer taucht weniger tief ein als im Fluss', () => {
    const fluss = shipState(0.6, WATER).draught!;
    const meer = shipState(0.6, toSI(LIQUID_DENSITY.salt)).draught!;
    expect(fluss).toBeCloseTo(0.045, 9);
    expect(meer).toBeCloseTo(0.045 / 1.025, 9);
    expect(meer).toBeLessThan(fluss);
  });

  it('Wasser läuft über die Bordwand nach der Überfallformel ein', () => {
    expect(shipInflow(0)).toBe(0);
    expect(shipInflow(-0.01)).toBe(0);
    // Q = 0,4 · 0,6 m · √(2 · 9,81) · (0,01 m)^1,5 ≈ 1,06 · 10⁻³ m³/s
    expect(shipInflow(0.01)).toBeCloseTo(0.4 * 0.6 * Math.sqrt(2 * G) * 1e-3, 12);
    expect(shipInflow(0.04) / shipInflow(0.01)).toBeCloseTo(8, 9);
    expect(SHIP_INNER).toBeCloseTo(1.2e-3, 12);
  });

  it('Überladenes Schiff läuft voll', () => {
    expect(shipState(0.9, WATER).maxLoad).toBeCloseTo(0.9, 9);
    expect(shipState(0.91, WATER).draught).toBeNull();
    expect(shipState(0.91, toSI(LIQUID_DENSITY.salt)).draught).not.toBeNull();
    expect(SHIP.H).toBe(0.06);
  });

  it('U-Boot: 600 cm³, halb geflutet schwebt es in Süßwasser', () => {
    expect(subShape().volume).toBeCloseTo(600e-6, 12);
    expect(hoverFill(WATER)).toBeCloseTo(0.5, 9);
    expect(subMass(0.5, WATER)).toBeCloseTo(0.6, 12);
    expect(floatState(subMass(0.5, WATER) / subShape().volume, WATER)).toBe('hover');
    expect(floatState(subMass(0, WATER) / subShape().volume, WATER)).toBe('float');
    expect(floatState(subMass(1, WATER) / subShape().volume, WATER)).toBe('sink');
    // im Meer braucht es mehr Wasser in der Tauchzelle
    expect(hoverFill(toSI(LIQUID_DENSITY.salt))).toBeCloseTo((615 - 450) / 307.5, 9);
    expect(SUB.tank).toBe(300e-6);
  });
});

describe('Modell: Überlaufgefäß und Messzylinder', () => {
  it('Verdrängtes Wasser landet vollständig im Becher (Volumen bleibt erhalten)', () => {
    const area = Math.PI * 0.075 ** 2;
    const spout = 0.15;
    const shape = cube(cm3(200));
    let o: Overflow = { inside: area * spout, caught: 0 };
    // ganz eingetaucht, Unterkante 2 cm über dem Boden
    for (let i = 0; i < 4000; i++) o = stepOverflow(o, area, spout, shape, 0.02, 0.002);
    expect(o.caught).toBeCloseTo(cm3(200), 9);
    expect(o.inside + o.caught).toBeCloseTo(area * spout, 12);
  });

  it('Messzylinder: 200 ml + 30 cm³ → 230 ml; schwimmender Körper ohne Draht', () => {
    expect(cylinderReading(200, displacedInCylinder(2.7, 30, 1, false))).toBe(230);
    expect(displacedInCylinder(0.6, 30, 1, false)).toBeCloseTo(18, 12);
    expect(displacedInCylinder(0.6, 30, 1, true)).toBe(30);
  });
});

describe('Modell: Heißluftballon', () => {
  it('Luftdichte aus der Gasgleichung: 1,225 kg/m³ bei 15 °C und 1013,25 hPa', () => {
    expect(airDensity(P0, KELVIN + 15)).toBeCloseTo(1.225, 4);
    expect(airDensity(P0, KELVIN + 100)).toBeCloseTo(0.9459, 4);
    // doppelte absolute Temperatur → halbe Dichte
    expect(airDensity(P0, 600) / airDensity(P0, 300)).toBeCloseTo(0.5, 12);
  });

  it('Tragkraft: 2500 m³, außen 15 °C, innen 100 °C → ≈ 698 kg', () => {
    const f = balloonForces(2500, KELVIN + 15, KELVIN + 100, 240);
    expect(f.liftKg).toBeCloseTo(697.6, 1);
    expect(balloonEquipment(2500)).toBe(315);
    // 698 kg > 315 kg + 240 kg → steigt
    expect(f.net).toBeGreaterThan(0);
    expect(f.net).toBeCloseTo((697.586 - 555) * G, 0);
  });

  it('Kalte Hülle: kein Auftrieb, der Ballon bleibt am Boden', () => {
    expect(balloonForces(2500, KELVIN + 15, KELVIN + 15, 0).liftKg).toBeCloseTo(0, 12);
    expect(equilibriumAltitude(2500, KELVIN + 15, KELVIN + 15, 0)).toBe(0);
  });

  it('Barometrische Höhenformel und Gleichgewichtshöhe', () => {
    const T = KELVIN + 15;
    expect(scaleHeight(T)).toBeCloseTo(8432, 0);
    expect(pressureAt(scaleHeight(T), T) / P0).toBeCloseTo(Math.exp(-1), 12);
    // Innentemperatur 90 °C: Tragkraft am Boden 632 kg bei 555 kg Gesamtmasse → h = H · ln(632/555) ≈ 1,1 km
    const h = equilibriumAltitude(2500, T, KELVIN + 90, 240);
    expect(h).toBeGreaterThan(1050);
    expect(h).toBeLessThan(1150);
    expect(balloonForces(2500, T, KELVIN + 90, 240, h).net).toBeCloseTo(0, 6);
  });

  it('Abhebetemperatur ≈ 79 °C bei 2500 m³ und 240 kg Zuladung', () => {
    const T = liftOffTemperature(2500, KELVIN + 15, 240) - KELVIN;
    expect(T).toBeGreaterThan(78);
    expect(T).toBeLessThan(80);
    expect(balloonForces(2500, KELVIN + 15, T + KELVIN, 240).net).toBeCloseTo(0, 6);
  });

  it('Bewegung: der Ballon steigt und kommt in der Gleichgewichtshöhe zur Ruhe', () => {
    const T = KELVIN + 15;
    let m = { h: 0, v: 0, TIn: KELVIN + 90 };
    for (let i = 0; i < 60000; i++) m = stepBalloon(m, 2500, T, KELVIN + 90, 240, 0.05);
    expect(m.h).toBeCloseTo(equilibriumAltitude(2500, T, KELVIN + 90, 240), -1);
    expect(Math.abs(m.v)).toBeLessThan(0.01);
  });
});
