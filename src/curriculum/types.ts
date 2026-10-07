import type { Localized } from '../i18n/config';

export type SubjectId = 'mathematik' | 'physik' | 'chemie';

/** "ready" = umgesetzt und spielbar, "planned" = im Lehrplan eingetragen, noch nicht gebaut. */
export type SimStatus = 'ready' | 'planned';

/** Vorschaubild auf Karten (siehe components/SimThumb.astro). */
export type Thumb =
  | 'line'
  | 'parabola'
  | 'sine'
  | 'unit-circle'
  | 'thales'
  | 'binomial'
  | 'pythagoras'
  | 'frequency'
  | 'doors'
  | 'monte-carlo'
  | 'secant'
  | 'galton'
  | 'generic';

/** Klassenstufen von–bis. Werte über 13 stehen für die Universität. */
export type GradeSpan = readonly [from: number, to: number];

export interface SimulationMeta {
  /** Eindeutige, stabile ID (wird auch als Ordnername der Umsetzung genutzt). */
  id: string;
  status: SimStatus;
  title: Localized;
  /** Ein bis zwei Sätze für Karten und Suchergebnisse. */
  summary?: Localized;
  /** URL-Segment je Sprache. Pflicht für fertige Simulationen. */
  slug?: Localized;
  grades: GradeSpan;
  /** Auch für die Universität geeignet. */
  uni?: boolean;
  /** IDs aus curriculum/kmk.ts. */
  kmk?: string[];
  /** Zusätzliche Suchbegriffe. */
  keywords?: Localized<string[]>;
  thumb?: Thumb;
}

export interface Topic {
  id: string;
  title: Localized;
  grades: GradeSpan;
  simulations: SimulationMeta[];
}

export interface Area {
  id: string;
  slug: Localized;
  title: Localized;
  description: Localized;
  grades: GradeSpan;
  kmk: string[];
  topics: Topic[];
}

export interface Subject {
  id: SubjectId;
  slug: Localized;
  title: Localized;
  description: Localized;
  status: 'active' | 'planned';
  areas: Area[];
}

/** Simulation mit ihrer Position im Lehrplan. */
export interface SimulationEntry extends SimulationMeta {
  subject: SubjectId;
  area: string;
  topic: string;
}
