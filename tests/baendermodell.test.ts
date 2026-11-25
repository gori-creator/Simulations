import { describe, expect, it } from 'vitest';
import {
  bandEdges,
  conductivity,
  fermi,
  intrinsicDensity,
  LEVELS,
  MATERIALS,
  resistance,
  splitLevels,
} from '../src/simulations/physik/baendermodell/model';

describe('Bänder entstehen', () => {
  const s = LEVELS[0]!;

  it('N Atome ergeben N Niveaus innerhalb der Bandgrenzen', () => {
    const lv = splitLevels(s, 12, 1);
    expect(lv).toHaveLength(12);
    const [lo, hi] = bandEdges(s, 1);
    for (const E of lv) {
      expect(E).toBeGreaterThan(lo);
      expect(E).toBeLessThan(hi);
    }
  });

  it('ein einzelnes Atom hat das ungestörte Niveau', () => {
    expect(splitLevels(s, 1, 1)[0]).toBeCloseTo(s.E0, 12);
  });

  it('weit entfernte Atome: Band schrumpft auf das Atomniveau', () => {
    const [lo, hi] = bandEdges(s, 4);
    expect(hi - lo).toBeLessThan(0.01);
  });

  it('beim Gitterabstand bleibt zwischen den Bändern eine Lücke', () => {
    expect(bandEdges(LEVELS[1]!, 1)[0]).toBeGreaterThan(bandEdges(s, 1)[1]);
  });
});

describe('Leiter, Halbleiter, Isolator', () => {
  it('Fermi-Verteilung: am Fermi-Niveau halb besetzt', () => {
    expect(fermi(1, 1, 300)).toBeCloseTo(0.5, 12);
    expect(fermi(0, 1, 300)).toBeGreaterThan(0.99);
    expect(fermi(2, 1, 300)).toBeLessThan(0.01);
  });

  it('Silizium bei 300 K: etwa 10¹⁰ freie Elektronen pro cm³', () => {
    const n = intrinsicDensity(1.12, 300);
    expect(n).toBeGreaterThan(3e9);
    expect(n).toBeLessThan(3e10);
  });

  it('Halbleiter leiten warm besser, Metalle schlechter', () => {
    const si = MATERIALS.si!;
    const cu = MATERIALS.cu!;
    expect(conductivity(si, 400)).toBeGreaterThan(10 * conductivity(si, 300));
    expect(conductivity(cu, 400)).toBeLessThan(conductivity(cu, 300));
  });

  it('Reihenfolge: Kupfer ≫ Germanium > Silizium ≫ Diamant', () => {
    const s = (id: string) => conductivity(MATERIALS[id]!, 300);
    expect(s('cu')).toBeGreaterThan(1e6 * s('ge'));
    expect(s('ge')).toBeGreaterThan(s('si'));
    expect(s('si')).toBeGreaterThan(1e20 * s('c'));
  });
});

describe('Supraleitung', () => {
  it('unter der Sprungtemperatur kein Widerstand', () => {
    expect(resistance(4, 4.15)).toBe(0);
    expect(resistance(4.3, 4.15)).toBeGreaterThan(0.5);
  });
});
