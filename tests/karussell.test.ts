import { describe, expect, it } from 'vitest';
import { readySimulations } from '../src/curriculum';
import { CAROUSEL_IDS } from '../src/lib/home/featured';
import { hasShot } from '../src/lib/sim-shots';

describe('Startseite: Karussell „Entdecken“', () => {
  const ready = new Set(readySimulations().map((s) => s.id));

  it('enthält nur fertige Simulationen mit Vorschaubild', () => {
    for (const id of CAROUSEL_IDS) {
      expect(ready.has(id), `${id} ist nicht fertig oder unbekannt`).toBe(true);
      expect(hasShot(id), `${id} hat kein Vorschaubild`).toBe(true);
    }
  });

  it('enthält keine Simulation doppelt', () => {
    expect(new Set(CAROUSEL_IDS).size).toBe(CAROUSEL_IDS.length);
  });
});
