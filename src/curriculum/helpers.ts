import type { Localized } from '../i18n/config';
import type { Area, GradeSpan, SimulationMeta, Topic } from './types';

/** Kurzschreibweise für einen zweisprachigen Wert (meist Text). */
export function L<T = string>(de: T, en: T): Localized<T> {
  return { de, en };
}

/** Eine im Lehrplan vorgesehene, aber noch nicht umgesetzte Simulation. */
export function planned(
  id: string,
  title: Localized,
  grades: GradeSpan,
  extra: Partial<Omit<SimulationMeta, 'id' | 'status' | 'title' | 'grades'>> = {},
): SimulationMeta {
  return { id, status: 'planned', title, grades, thumb: 'generic', ...extra };
}

/** Kleinster Bereich, der alle Klassenstufen umfasst (Uni zählt als Stufe 14). */
export function spanOf(items: { grades: GradeSpan; uni?: boolean }[]): GradeSpan {
  const from = Math.min(...items.map((i) => i.grades[0]));
  const to = Math.max(...items.map((i) => (i.uni ? Math.max(i.grades[1], 14) : i.grades[1])));
  return [from, to];
}

/** Thema; die Klassenstufen ergeben sich aus den enthaltenen Simulationen. */
export function topic(id: string, title: Localized, simulations: SimulationMeta[]): Topic {
  return { id, title, grades: spanOf(simulations), simulations };
}

/** Themenbereich; die Klassenstufen ergeben sich aus den Themen. */
export function area(definition: Omit<Area, 'grades'>): Area {
  return { ...definition, grades: spanOf(definition.topics) };
}
