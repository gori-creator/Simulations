import { L } from './helpers';
import type { Subject } from './types';

/** Chemie ist für später vorgesehen. Bereiche können hier ergänzt werden. */
export const chemie: Subject = {
  id: 'chemie',
  slug: L('chemie', 'chemistry'),
  title: L('Chemie', 'Chemistry'),
  description: L(
    'Teilchenmodell, Atombau, Reaktionen und Gleichgewichte – in Vorbereitung.',
    'Particle model, atomic structure, reactions and equilibria – in preparation.',
  ),
  status: 'planned',
  areas: [],
};
