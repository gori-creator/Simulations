import { describe, expect, it } from 'vitest';
import {
  BATTERY_R,
  BATTERY_U,
  DEVICE_R,
  filamentTemperature,
  FUSE_RATING,
  fuseBlows,
  glowOf,
  LAMP_P_NOMINAL,
  MATERIAL_IDS,
  MATERIALS,
  NOMINAL_T,
  ROOM_T,
  solveCircuit,
} from '../src/simulations/physik/einfacher-stromkreis/model';

describe('Modell: Einfacher Stromkreis', () => {
  it('lässt im offenen Stromkreis keinen Strom fließen', () => {
    const res = solveCircuit({ device: 'lamp', closed: false });
    expect(res.I).toBe(0);
    expect(res.Idevice).toBe(0);
    expect(res.Pdevice).toBe(0);
    expect(res.short).toBe(false);
  });

  it('berechnet die Stromstärke im geschlossenen Stromkreis (Lampe 4,5 V / 0,3 A)', () => {
    const res = solveCircuit({ device: 'lamp', closed: true });
    expect(res.I).toBeCloseTo(BATTERY_U / (BATTERY_R + DEVICE_R.lamp), 12);
    expect(res.I).toBeGreaterThan(0.25);
    expect(res.I).toBeLessThan(0.3);
    // unverzweigt: durch Batterie und Lampe fließt derselbe Strom
    expect(res.Idevice).toBeCloseTo(res.I, 12);
    expect(res.Udevice).toBeCloseTo(res.I * DEVICE_R.lamp, 12);
    expect(res.Udevice).toBeLessThan(BATTERY_U);
    // Lampe leuchtet fast mit Nennleistung
    expect(res.Pdevice / LAMP_P_NOMINAL).toBeGreaterThan(0.85);
  });

  it('beschreibt den Kurzschluss: Strom am Gerät vorbei, sehr große Stromstärke', () => {
    const normal = solveCircuit({ device: 'lamp', closed: true });
    const short = solveCircuit({ device: 'lamp', closed: true, bridge: true });
    expect(short.short).toBe(true);
    expect(short.I).toBeGreaterThan(5);
    expect(short.I / normal.I).toBeGreaterThan(15);
    expect(short.Idevice).toBeLessThan(0.05 * normal.Idevice);
    expect(glowOf(filamentTemperature(short.Pdevice, LAMP_P_NOMINAL))).toBe(0);
    // Knotenregel: Gerät und Überbrückung teilen sich den Gesamtstrom
    expect(short.Idevice + short.Ibridge).toBeCloseTo(short.I, 10);
    // Ohne geschlossenen Schalter gibt es auch keinen Kurzschlussstrom
    expect(solveCircuit({ device: 'lamp', closed: false, bridge: true }).I).toBe(0);
  });

  it('lässt die Sicherung nur bei Überlast durchschmelzen', () => {
    const normal = solveCircuit({ device: 'motor', closed: true, fuse: 'ok' });
    const short = solveCircuit({ device: 'motor', closed: true, fuse: 'ok', bridge: true });
    expect(fuseBlows(normal.I)).toBe(false);
    expect(fuseBlows(short.I)).toBe(true);
    expect(fuseBlows(FUSE_RATING)).toBe(false);
    const blown = solveCircuit({ device: 'motor', closed: true, fuse: 'blown', bridge: true });
    expect(blown.I).toBe(0);
  });

  it('unterscheidet Leiter und Nichtleiter in der Prüfstrecke', () => {
    expect(MATERIAL_IDS).toHaveLength(8);
    for (const id of MATERIAL_IDS) {
      const m = MATERIALS[id];
      const res = solveCircuit({ device: 'lamp', closed: true, seriesR: m.R });
      if (m.conductor) {
        expect(Number.isFinite(m.R), id).toBe(true);
        expect(res.I, id).toBeGreaterThan(0.15);
      } else {
        expect(m.R, id).toBe(Infinity);
        expect(res.I, id).toBe(0);
      }
    }
    expect(['clip', 'coin', 'foil', 'lead'].every((id) => MATERIALS[id as 'clip'].conductor)).toBe(true);
    expect(['wood', 'eraser', 'ruler', 'glass'].some((id) => MATERIALS[id as 'wood'].conductor)).toBe(false);
  });

  it('lässt die Lampe mit Graphit schwächer leuchten als mit Metall', () => {
    const metal = solveCircuit({ device: 'lamp', closed: true, seriesR: MATERIALS.clip.R });
    const graphite = solveCircuit({ device: 'lamp', closed: true, seriesR: MATERIALS.lead.R });
    expect(graphite.I).toBeLessThan(metal.I);
    const glowMetal = glowOf(filamentTemperature(metal.Pdevice, LAMP_P_NOMINAL));
    const glowGraphite = glowOf(filamentTemperature(graphite.Pdevice, LAMP_P_NOMINAL));
    expect(glowGraphite).toBeGreaterThan(0.2);
    expect(glowGraphite).toBeLessThan(glowMetal * 0.8);
  });

  it('bestimmt Temperatur und Leuchten der Glühwendel', () => {
    expect(filamentTemperature(0, LAMP_P_NOMINAL)).toBe(ROOM_T);
    expect(filamentTemperature(LAMP_P_NOMINAL, LAMP_P_NOMINAL)).toBeCloseTo(NOMINAL_T, 9);
    // P ~ T⁴: ein Sechzehntel der Leistung halbiert die Temperatur
    expect(filamentTemperature(LAMP_P_NOMINAL / 16, LAMP_P_NOMINAL)).toBeCloseTo(NOMINAL_T / 2, 9);
    expect(glowOf(ROOM_T)).toBe(0);
    expect(glowOf(700)).toBe(0);
    expect(glowOf(NOMINAL_T)).toBeCloseTo(1, 12);
    let last = -1;
    for (let T = 300; T <= 3000; T += 100) {
      expect(glowOf(T)).toBeGreaterThanOrEqual(last);
      last = glowOf(T);
    }
  });
});
