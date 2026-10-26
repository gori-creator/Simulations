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

  // Von Hand nachgerechnet (Prüfrunde): I = U / (R_i + R_Gerät + …)
  it('liefert die nachgerechneten Stromstärken der Geräte', () => {
    // Lampe: 4,5 V / (0,7 Ω + 15 Ω) = 0,2866 A → Anzeige „0,29 A“
    expect(solveCircuit({ device: 'lamp', closed: true }).I).toBeCloseTo(0.2866, 4);
    // Motor: 4,5 V / 18,7 Ω = 0,2406 A → „0,24 A“
    expect(solveCircuit({ device: 'motor', closed: true }).I).toBeCloseTo(0.2406, 4);
    // Klingel: 4,5 V / 22,7 Ω = 0,1982 A → „0,20 A“
    expect(solveCircuit({ device: 'bell', closed: true }).I).toBeCloseTo(0.1982, 4);
    // Bleistiftmine: 4,5 V / (0,7 + 6 + 15) Ω = 0,2074 A → „0,21 A“
    expect(solveCircuit({ device: 'lamp', closed: true, seriesR: MATERIALS.lead.R }).I).toBeCloseTo(0.2074, 4);
  });

  it('liefert die nachgerechneten Werte beim Kurzschluss', () => {
    // Lampe ∥ Leitung: 15 · 0,03 / 15,03 = 0,02994 Ω; I = 4,5 / 0,72994 = 6,165 A → „6,2 A“
    const short = solveCircuit({ device: 'lamp', closed: true, bridge: true });
    expect(short.I).toBeCloseTo(6.165, 3);
    // etwa 22-mal so groß wie ohne Kurzschluss (6,165 / 0,2866 = 21,5)
    expect(Math.round(short.I / solveCircuit({ device: 'lamp', closed: true }).I)).toBe(22);
    // Motor und Klingel: fast derselbe Kurzschlussstrom, aber größeres Verhältnis (26 bzw. 31)
    for (const [device, k] of [['motor', 26], ['bell', 31]] as const) {
      const sc = solveCircuit({ device, closed: true, bridge: true });
      expect(sc.I, device).toBeCloseTo(6.165, 2);
      expect(Math.round(sc.I / solveCircuit({ device, closed: true }).I), device).toBe(k);
    }
    // Durch die Lampe fließen nur noch etwa 12 mA (0,1846 V / 15 Ω), sie bleibt dunkel
    expect(short.Idevice).toBeCloseTo(0.0123, 4);
  });

  it('lässt die Sicherung im normalen Betrieb ganz und schmilzt sie beim Kurzschluss', () => {
    // mit Sicherung (0,05 Ω): 4,5 / 15,75 = 0,2857 A < 1 A
    const ok = solveCircuit({ device: 'lamp', closed: true, fuse: 'ok' });
    expect(ok.I).toBeCloseTo(0.2857, 4);
    expect(fuseBlows(ok.I)).toBe(false);
    // Kurzschluss mit Sicherung: 4,5 / (0,7 + 0,05 + 0,02994) = 5,77 A > 1 A
    const sc = solveCircuit({ device: 'lamp', closed: true, fuse: 'ok', bridge: true });
    expect(sc.I).toBeCloseTo(5.770, 3);
    expect(fuseBlows(sc.I)).toBe(true);
    // offener Schalter: auch mit Überbrückung kein Strom, Sicherung bleibt ganz
    expect(fuseBlows(solveCircuit({ device: 'lamp', closed: false, fuse: 'ok', bridge: true }).I)).toBe(false);
  });

  it('bestimmt die Helligkeit der Lampe mit Metall und mit Graphit', () => {
    // Metall: P = 0,2866² · 15 = 1,232 W (91 % von 1,35 W) → T = 2700 K · 0,9126^¼ ≈ 2639 K
    const metal = solveCircuit({ device: 'lamp', closed: true });
    expect(metal.Pdevice / LAMP_P_NOMINAL).toBeCloseTo(0.9126, 3);
    expect(filamentTemperature(metal.Pdevice, LAMP_P_NOMINAL)).toBeCloseTo(2639, -1);
    // Graphit: P = 0,2074² · 15 = 0,645 W (48 %) → T ≈ 2245 K, Leuchten ((2245 − 800)/1900)² ≈ 0,58
    const lead = solveCircuit({ device: 'lamp', closed: true, seriesR: MATERIALS.lead.R });
    const T = filamentTemperature(lead.Pdevice, LAMP_P_NOMINAL);
    expect(T).toBeCloseTo(2245, -1);
    expect(glowOf(T)).toBeCloseTo(0.58, 2);
  });
});
