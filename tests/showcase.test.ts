import { describe, expect, it } from 'vitest';
import { readySimulations } from '../src/curriculum';
import { byShowcase, SHOWCASE_IDS, showcaseRank } from '../src/lib/home/showcase';
import { hasShot } from '../src/lib/sim-shots';

describe('Startseite: eindrucksvolle Simulationen zuerst', () => {
  const ready = new Set(readySimulations().map((s) => s.id));
  it('nur fertige Simulationen mit Vorschaubild, keine doppelt', () => {
    for (const id of SHOWCASE_IDS) {
      expect(ready.has(id), `${id} ist nicht fertig oder unbekannt`).toBe(true);
      expect(hasShot(id), `${id} hat kein Vorschaubild`).toBe(true);
    }
    expect(new Set(SHOWCASE_IDS).size).toBe(SHOWCASE_IDS.length);
  });
  it('sortiert stabil: genannte zuerst, übrige in alter Reihenfolge', () => {
    const list = [{ id: 'x1' }, { id: 'galtonbrett' }, { id: 'x2' }, { id: 'energieerhaltung' }];
    expect(byShowcase(list).map((s) => s.id)).toEqual(['energieerhaltung', 'galtonbrett', 'x1', 'x2']);
    expect(showcaseRank('gibt-es-nicht')).toBe(Number.POSITIVE_INFINITY);
  });
});
