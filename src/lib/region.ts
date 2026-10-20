import { STATE_CURRICULA, simulationsOfGrade } from '../curriculum/lehrplaene';
import type { StateCurriculum } from '../curriculum/lehrplaene';
import type { SubjectId } from '../curriculum/types';
import type { Lang, Localized } from '../i18n/config';

/**
 * Einstellung „Bundesland“: Rechenlogik für die Sortierung nach den
 * Jahrgangsstufen eines Landes.
 *
 * - Die Länderliste entsteht allein aus `STATE_CURRICULA`: Jedes Land mit
 *   mindestens einem Lehrplan erscheint automatisch in der Auswahl.
 * - Länder-ID: aus `state.de` abgeleitet ("Bayern" → "bayern",
 *   "Baden-Württemberg" → "baden-wuerttemberg"), optional per `region`
 *   im Lehrplan überschreibbar. Die ID steht in `localStorage`, im
 *   Attribut `data-region` am `<html>` und in CSS-Variablen (`--ro-<id>`),
 *   daher nur Kleinbuchstaben, Ziffern und Bindestriche.
 * - Alle Funktionen nehmen die Lehrpläne als letzten Parameter, damit Tests
 *   mit eigenen (Test-)Lehrplänen rechnen können.
 */

export interface Region {
  id: string;
  /** Name des Landes (aus dem ersten Lehrplan dieses Landes). */
  name: Localized;
  curricula: StateCurriculum[];
}

/** Ordnungszahl für Simulationen ohne Eintrag im Landeslehrplan (stehen am Ende). */
export const REGION_ORDER_NONE = 100000;

/** Schlüssel in localStorage. */
export const REGION_STORAGE_KEY = 'region';

/** Text → ID: Kleinbuchstaben, Umlaute ausgeschrieben, sonst nur a–z, 0–9 und Bindestrich. */
export function slugifyRegion(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Länder-ID eines Lehrplans. */
export function regionIdOf(curriculum: StateCurriculum): string {
  return curriculum.region ?? slugifyRegion(curriculum.state.de);
}

/** Alle Länder mit mindestens einem Lehrplan, alphabetisch nach dem Namen in der Sprache `lang`. */
export function regionsOf(lang: Lang, curricula: StateCurriculum[] = STATE_CURRICULA): Region[] {
  const byId = new Map<string, Region>();
  for (const curriculum of curricula) {
    const id = regionIdOf(curriculum);
    const region = byId.get(id);
    if (region) region.curricula.push(curriculum);
    else byId.set(id, { id, name: curriculum.state, curricula: [curriculum] });
  }
  return [...byId.values()].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
}

/** Nur die IDs (z. B. für das Skript im `<head>`). */
export function regionIds(curricula: StateCurriculum[] = STATE_CURRICULA): string[] {
  return regionsOf('de', curricula).map((r) => r.id);
}

/**
 * Lehrplan eines Landes für ein Fach. Gibt es mehrere (z. B. später
 * verschiedene Schularten), gilt der erste in `STATE_CURRICULA`.
 */
export function curriculumFor(
  subject: SubjectId,
  regionId: string,
  curricula: StateCurriculum[] = STATE_CURRICULA,
): StateCurriculum | undefined {
  return curricula.find((c) => c.subject === subject && regionIdOf(c) === regionId);
}

/** Lehrpläne eines Landes; je Fach nur der maßgebliche (siehe `curriculumFor`). */
function leadingCurricula(regionId: string, curricula: StateCurriculum[]): StateCurriculum[] {
  const seen = new Set<SubjectId>();
  return curricula.filter((c) => {
    if (regionIdOf(c) !== regionId || seen.has(c.subject)) return false;
    seen.add(c.subject);
    return true;
  });
}

/** Jahrgangsstufen, in denen eine Simulation im Land vorkommt (aufsteigend, ohne Doppelungen). */
export function regionGrades(simId: string, regionId: string, curricula: StateCurriculum[] = STATE_CURRICULA): number[] {
  const grades = leadingCurricula(regionId, curricula).flatMap((c) =>
    c.grades.filter((g) => simulationsOfGrade(g).includes(simId)).map((g) => g.grade),
  );
  return [...new Set(grades)].sort((a, b) => a - b);
}

/**
 * Sortierschlüssel einer Simulation im Land: erste Jahrgangsstufe · 1000 +
 * Position innerhalb dieser Stufe (Reihenfolge der Lernbereiche).
 * `REGION_ORDER_NONE`, wenn sie im Land nicht vorkommt.
 */
export function regionSortKey(simId: string, regionId: string, curricula: StateCurriculum[] = STATE_CURRICULA): number {
  let best = REGION_ORDER_NONE;
  for (const c of leadingCurricula(regionId, curricula)) {
    for (const g of c.grades) {
      const index = simulationsOfGrade(g).indexOf(simId);
      if (index >= 0) best = Math.min(best, g.grade * 1000 + Math.min(index, 999));
    }
  }
  return best;
}

/** Sortierschlüssel aller Länder, in denen die Simulation vorkommt (für `data-region-order`). */
export function regionOrders(simId: string, curricula: StateCurriculum[] = STATE_CURRICULA): Record<string, number> {
  const orders: Record<string, number> = {};
  for (const id of regionIds(curricula)) {
    const key = regionSortKey(simId, id, curricula);
    if (key < REGION_ORDER_NONE) orders[id] = key;
  }
  return orders;
}

/** Inline-Stil mit den CSS-Variablen `--ro-<land>` (für die Sortierung per CSS `order`). */
export function regionOrderStyle(orders: Record<string, number>): string | undefined {
  const parts = Object.entries(orders).map(([id, key]) => `--ro-${id}:${key}`);
  return parts.length ? parts.join(';') : undefined;
}

/** Stabile Sortierung nach dem Land: Vorkommende nach Schlüssel, die übrigen dahinter in bisheriger Reihenfolge. */
export function sortForRegion<T extends { id: string }>(
  items: readonly T[],
  regionId: string,
  curricula: StateCurriculum[] = STATE_CURRICULA,
): T[] {
  return items
    .map((item, index) => ({ item, index, key: regionSortKey(item.id, regionId, curricula) }))
    .sort((a, b) => a.key - b.key || a.index - b.index)
    .map((e) => e.item);
}

export interface RegionGradeGroup {
  grade: number;
  /** Simulationen, die hier zum ersten Mal vorkommen (Reihenfolge der Lernbereiche). */
  first: string[];
  /** Simulationen, die schon in einer früheren Stufe vorkamen. */
  again: string[];
}

/**
 * Gruppierung für die Fachseite: Simulationen (`simIds`, z. B. alle fertigen
 * des Fachs) nach den Jahrgangsstufen des Lehrplans; `rest` = nicht enthalten.
 */
export function groupByCurriculumGrade(
  curriculum: StateCurriculum,
  simIds: readonly string[],
): { groups: RegionGradeGroup[]; rest: string[] } {
  const allowed = new Set(simIds);
  const shown = new Set<string>();
  const groups: RegionGradeGroup[] = [];
  for (const g of [...curriculum.grades].sort((a, b) => a.grade - b.grade)) {
    const ids = simulationsOfGrade(g).filter((id) => allowed.has(id));
    const first = ids.filter((id) => !shown.has(id));
    const again = ids.filter((id) => shown.has(id));
    first.forEach((id) => shown.add(id));
    if (ids.length > 0) groups.push({ grade: g.grade, first, again });
  }
  return { groups, rest: simIds.filter((id) => !shown.has(id)) };
}

/**
 * CSS für alle Länder (zur Bauzeit erzeugt, im `<head>`):
 * - `data-region-only="<land>"`: nur bei diesem Land sichtbar,
 * - `data-region-hide="<land> <land>"`: bei diesen Ländern versteckt,
 * - `data-region-sort`: Kinder nach `--ro-<land>` anordnen (ohne Eintrag ans Ende),
 * - `data-region-mark="<land>"`: beim gewählten Land hervorheben.
 */
export function regionCss(ids: readonly string[] = regionIds()): string {
  return ids
    .map((id) =>
      [
        `:root:not([data-region="${id}"]) [data-region-only="${id}"]{display:none!important}`,
        `:root[data-region="${id}"] [data-region-hide~="${id}"]{display:none!important}`,
        `:root[data-region="${id}"] [data-region-sort]>*{order:var(--ro-${id},${REGION_ORDER_NONE})}`,
        `:root[data-region="${id}"] [data-region-mark~="${id}"]{border-color:var(--brand);box-shadow:inset 3px 0 0 var(--brand)}`,
      ].join(''),
    )
    .join('');
}
