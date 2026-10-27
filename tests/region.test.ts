import { describe, expect, it } from 'vitest';
import { readySimulations } from '../src/curriculum';
import { STATE_CURRICULA } from '../src/curriculum/lehrplaene';
import type { StateCurriculum } from '../src/curriculum/lehrplaene';
import { L } from '../src/curriculum/helpers';
import {
  curriculumFor,
  groupByCurriculumGrade,
  REGION_ORDER_NONE,
  regionCss,
  regionGrades,
  regionIdOf,
  regionIds,
  regionOrders,
  regionsOf,
  regionSortKey,
  slugifyRegion,
  sortForRegion,
} from '../src/lib/region';

/** Erfundener Lehrplan, um zu prüfen, dass neue Dateien ohne Code-Änderung aufgenommen werden. */
const testCurriculum: StateCurriculum = {
  id: 'musterland-gymnasium-physik',
  subject: 'physik',
  slug: L('musterland-gymnasium', 'sample-state-gymnasium'),
  state: L('Musterland', 'Sample state'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Test',
  grades: [
    { grade: 8, sourceUrl: 'https://example.org/8', units: [{ code: '1', title: L('A', 'A'), simulations: ['ohmsches-gesetz'] }] },
    { grade: 7, sourceUrl: 'https://example.org/7', units: [{ code: '1', title: L('B', 'B'), simulations: ['reflexion', 'linsen'] }] },
  ],
};

describe('Einstellung Bundesland', () => {
  it('leitet die Länderliste aus den Lehrplänen ab (Bayern, Hessen, Niedersachsen, Nordrhein-Westfalen, Sachsen-Anhalt)', () => {
    const ids = regionIds();
    expect(ids).toContain('bayern');
    expect(ids).toContain('hessen');
    expect(ids).toContain('niedersachsen');
    expect(ids).toContain('nordrhein-westfalen');
    expect(ids).toContain('sachsen-anhalt');
    expect(new Set(ids).size).toBe(ids.length);
    expect(regionsOf('de').map((r) => r.name.de)).toEqual([...regionsOf('de').map((r) => r.name.de)].sort((a, b) => a.localeCompare(b, 'de')));
  });

  it('hat CSS-taugliche Länder-IDs und einheitliche Ländernamen', () => {
    for (const c of STATE_CURRICULA) expect(regionIdOf(c), c.id).toMatch(/^[a-z][a-z0-9-]*$/);
    for (const region of regionsOf('de')) {
      for (const c of region.curricula) expect(c.state, c.id).toEqual(region.name);
    }
  });

  it('wandelt Ländernamen in IDs um', () => {
    expect(slugifyRegion('Bayern')).toBe('bayern');
    expect(slugifyRegion('Baden-Württemberg')).toBe('baden-wuerttemberg');
    expect(slugifyRegion('Thüringen')).toBe('thueringen');
    expect(slugifyRegion('Nordrhein-Westfalen')).toBe('nordrhein-westfalen');
  });

  it('kennt die Jahrgangsstufen bekannter Simulationen in Bayern', () => {
    expect(regionGrades('pythagoras', 'bayern')).toEqual([9]);
    expect(regionGrades('termbaum', 'bayern')).toEqual([5, 6, 7]);
    expect(regionSortKey('stellenwerte', 'bayern')).toBe(5000);
    expect(regionSortKey('pythagoras', 'bayern')).toBeGreaterThanOrEqual(9000);
    expect(regionSortKey('pythagoras', 'bayern')).toBeLessThan(10000);
  });

  it('stellt Simulationen ohne Eintrag ans Ende, sonst in bisheriger Reihenfolge', () => {
    const sims = [{ id: 'doppler-effekt' }, { id: 'ohmsches-gesetz' }, { id: 'pythagoras' }, { id: 'stellenwerte' }];
    // Nach Jahrgangsstufe in Bayern (Mathematik und Physik); ohne Eintrag (Doppler-Effekt) hinten.
    expect(sortForRegion(sims, 'bayern').map((s) => s.id)).toEqual(['stellenwerte', 'ohmsches-gesetz', 'pythagoras', 'doppler-effekt']);
    expect(regionSortKey('doppler-effekt', 'bayern')).toBe(REGION_ORDER_NONE);
    expect(regionGrades('doppler-effekt', 'bayern')).toEqual([]);
    expect(regionGrades('ohmsches-gesetz', 'bayern')).toEqual([8]);
    // Unbekanntes Land: nichts ändert sich
    expect(sortForRegion(sims, 'atlantis').map((s) => s.id)).toEqual(sims.map((s) => s.id));
  });

  it('meldet fehlende Lehrpläne für Fach und Land ohne Fehler', () => {
    expect(curriculumFor('mathematik', 'bayern')?.id).toBe('bayern-gymnasium-mathematik');
    expect(curriculumFor('physik', 'hessen')?.id).toBe('hessen-gymnasium-physik');
    expect(curriculumFor('physik', 'bayern')?.id).toBe('bayern-gymnasium-physik');
    expect(curriculumFor('mathematik', 'nordrhein-westfalen')?.id).toBe('nordrhein-westfalen-gymnasium-mathematik');
    expect(curriculumFor('chemie', 'bayern')).toBeUndefined();
  });

  it('nimmt einen neuen Lehrplan automatisch auf', () => {
    const curricula = [...STATE_CURRICULA, testCurriculum];
    expect(regionIds(curricula)).toContain('musterland');
    expect(regionsOf('de', curricula).map((r) => r.id)).toEqual(['baden-wuerttemberg', 'bayern', 'hessen', 'musterland', 'niedersachsen', 'nordrhein-westfalen', 'sachsen-anhalt']);
    expect(curriculumFor('physik', 'musterland', curricula)?.id).toBe(testCurriculum.id);
    expect(regionGrades('reflexion', 'musterland', curricula)).toEqual([7]);
    expect(regionOrders('ohmsches-gesetz', curricula)['musterland']).toBe(8000);
    expect(regionCss(regionIds(curricula))).toContain('[data-region="musterland"]');
    // Der Bayern-Physik-Lehrplan steht mit dem Mathematik-Lehrplan unter "bayern".
    expect(curriculumFor('physik', 'bayern', curricula)?.id).toBe('bayern-gymnasium-physik');
    expect(regionsOf('de', curricula).find((r) => r.id === 'bayern')?.curricula).toHaveLength(2);
  });

  it('gruppiert die Fachseite nach Jahrgangsstufen ohne Simulationen zu verlieren', () => {
    const ids = readySimulations()
      .filter((s) => s.subject === 'mathematik')
      .map((s) => s.id);
    const curriculum = curriculumFor('mathematik', 'bayern')!;
    const { groups, rest } = groupByCurriculumGrade(curriculum, ids);
    const first = groups.flatMap((g) => g.first);
    expect(new Set(first).size).toBe(first.length);
    expect([...first, ...rest].sort()).toEqual([...ids].sort());
    expect(groups.map((g) => g.grade)).toEqual([...groups.map((g) => g.grade)].sort((a, b) => a - b));
    expect(groups.find((g) => g.grade === 9)?.first).toContain('pythagoras');
    expect(groups.find((g) => g.grade === 6)?.again).toContain('termbaum');
  });
});
