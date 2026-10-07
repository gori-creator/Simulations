import { allSimulations, getArea, getSimulation, getSubject, SUBJECTS } from '../curriculum';
import { getCurriculum, STATE_CURRICULA } from '../curriculum/lehrplaene';
import type { SubjectId } from '../curriculum/types';
import { LANGS, type Lang, type Localized } from '../i18n/config';

/**
 * Alle Seiten der Website und ihre (sprachabhängigen) Adressen.
 *
 * Seiten werden über eine `Route` beschrieben statt über feste Pfade. So kann
 * der Sprachumschalter zu jeder Seite die passende Übersetzung finden und
 * Links bleiben korrekt, wenn sich Slugs ändern.
 */
export type InfoPageId = 'teachers' | 'about' | 'imprint' | 'privacy';

export type Route =
  | { kind: 'home' }
  | { kind: 'catalog' }
  | { kind: 'page'; page: InfoPageId }
  | { kind: 'subject'; subject: SubjectId }
  | { kind: 'area'; subject: SubjectId; area: string }
  | { kind: 'simulation'; id: string }
  /** Länder-Lehrplan: Übersicht aller Jahrgangsstufen */
  | { kind: 'curriculum'; curriculum: string }
  /** Länder-Lehrplan: eine Jahrgangsstufe */
  | { kind: 'grade'; curriculum: string; grade: number };

export const INFO_PAGES: Record<InfoPageId, Localized> = {
  teachers: { de: 'lehrkraefte', en: 'teachers' },
  about: { de: 'ueber', en: 'about' },
  imprint: { de: 'impressum', en: 'imprint' },
  privacy: { de: 'datenschutz', en: 'privacy' },
};

export const CATALOG_SLUG: Localized = { de: 'simulationen', en: 'simulations' };

/** URL-Segment einer Jahrgangsstufe, z. B. "jahrgangsstufe-7" / "grade-7". */
export function gradeSlug(lang: Lang, grade: number): string {
  return lang === 'de' ? `jahrgangsstufe-${grade}` : `grade-${grade}`;
}

/** Pfadsegmente einer Route (ohne Sprache und ohne Basis-Pfad). */
export function routeSegments(lang: Lang, route: Route): string[] {
  switch (route.kind) {
    case 'home':
      return [];
    case 'catalog':
      return [CATALOG_SLUG[lang]];
    case 'page':
      return [INFO_PAGES[route.page][lang]];
    case 'subject':
      return [getSubject(route.subject).slug[lang]];
    case 'area':
      return [getSubject(route.subject).slug[lang], getArea(route.subject, route.area).slug[lang]];
    case 'curriculum': {
      const curriculum = getCurriculum(route.curriculum);
      return [getSubject(curriculum.subject).slug[lang], curriculum.slug[lang]];
    }
    case 'grade': {
      const curriculum = getCurriculum(route.curriculum);
      return [getSubject(curriculum.subject).slug[lang], curriculum.slug[lang], gradeSlug(lang, route.grade)];
    }
    case 'simulation': {
      const sim = getSimulation(route.id);
      if (!sim.slug) throw new Error(`Simulation ${sim.id} hat keinen Slug (nur fertige Simulationen haben eine Seite).`);
      return [getSubject(sim.subject).slug[lang], getArea(sim.subject, sim.area).slug[lang], sim.slug[lang]];
    }
  }
}

/** Pfad relativ zur Website-Wurzel, z. B. "/de/mathematik/". */
export function routePath(lang: Lang, route: Route): string {
  const segments = [lang, ...routeSegments(lang, route)];
  return `/${segments.join('/')}/`;
}

/** Link mit Basis-Pfad (für GitHub Pages o. Ä.). */
export function href(lang: Lang, route: Route): string {
  return withBase(routePath(lang, route));
}

/** Adressen dieser Route in allen Sprachen (für Sprachumschalter und hreflang). */
export function alternates(route: Route): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((l) => [l, href(l, route)])) as Record<Lang, string>;
}

/** Stellt einem Pfad den konfigurierten Basis-Pfad voran. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Alle Routen außer der Startseite – Grundlage für `getStaticPaths`. */
export function allRoutes(): Route[] {
  const routes: Route[] = [{ kind: 'catalog' }];
  for (const page of Object.keys(INFO_PAGES) as InfoPageId[]) routes.push({ kind: 'page', page });
  for (const subject of SUBJECTS) {
    routes.push({ kind: 'subject', subject: subject.id });
    for (const area of subject.areas) routes.push({ kind: 'area', subject: subject.id, area: area.id });
  }
  for (const sim of allSimulations()) if (sim.status === 'ready') routes.push({ kind: 'simulation', id: sim.id });
  for (const curriculum of STATE_CURRICULA) {
    routes.push({ kind: 'curriculum', curriculum: curriculum.id });
    for (const grade of curriculum.grades) routes.push({ kind: 'grade', curriculum: curriculum.id, grade: grade.grade });
  }
  return routes;
}
