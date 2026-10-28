import { describe, expect, it } from 'vitest';
import { allSimulations } from '../src/curriculum';

/**
 * Kartentexte ohne Schablonen-Formulierungen (docs/TON.md). Bewusst nur wenige,
 * eindeutige Muster, damit der Test nicht beim Formulieren im Weg steht.
 */
const PATTERNS = [/\bSo verstehst du\b/, /\bSo lernst du\b/, /\bund sieh,/, /^Dazu /m, /\. Dazu /, /Interaktive Simulation/i, /Interactive simulation/i];

describe('Ton der Kartentexte', () => {
  for (const sim of allSimulations()) {
    if (!sim.summary) continue;
    it(sim.id, () => {
      for (const text of [sim.summary!.de, sim.summary!.en]) {
        expect(PATTERNS.filter((p) => p.test(text)).map(String)).toEqual([]);
      }
    });
  }
});
