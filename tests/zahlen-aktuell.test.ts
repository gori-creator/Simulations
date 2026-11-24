import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readySimulations } from '../src/curriculum';

/**
 * Zahlen in Texten, die von Hand gepflegt werden (README, „Über uns“), müssen
 * zum Lehrplan passen – sonst steht dort nach jeder neuen Simulation ein veralteter Wert.
 */
describe('Zahlen in README und „Über uns“ sind aktuell', () => {
  const ready = readySimulations();
  const n = ready.length;
  const math = ready.filter((s) => s.subject === 'mathematik').length;
  const phys = ready.filter((s) => s.subject === 'physik').length;

  it('README nennt die richtige Anzahl', () => {
    const text = readFileSync('README.md', 'utf8');
    expect(text).toContain(`**${n} fertige Simulationen** (${math} Mathematik, ${phys} Physik)`);
  });
  it('„Über uns“ (DE und EN) nennt die richtige Anzahl', () => {
    expect(readFileSync('src/content/pages/de/about.md', 'utf8')).toContain(`${n} Simulationen entlang`);
    expect(readFileSync('src/content/pages/en/about.md', 'utf8')).toContain(`${n} simulations along`);
  });
});
