import type { Localized } from '../i18n/config';
import type { GradeSpan, SimulationMeta } from './types';

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
