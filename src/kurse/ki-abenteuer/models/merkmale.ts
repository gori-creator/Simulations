/**
 * Lektion „Gute Merkmale“: Welche Eigenschaft trennt Vögel und Säugetiere?
 * Für jedes Merkmal nimmt Bit die bessere der beiden Regeln
 * („ja → Vogel“ oder „ja → Säugetier“) und zählt, wie viele Tiere stimmen.
 */
export type Group = 'bird' | 'mammal';
export type FeatureId = 'feathers' | 'flies' | 'twoLegs' | 'brightPhoto' | 'weekend';

export interface Creature {
  id: string;
  group: Group;
  has: Record<FeatureId, boolean>;
}

const c = (id: string, group: Group, feathers: number, flies: number, twoLegs: number, brightPhoto: number, weekend: number): Creature => ({
  id,
  group,
  has: { feathers: !!feathers, flies: !!flies, twoLegs: !!twoLegs, brightPhoto: !!brightPhoto, weekend: !!weekend },
});

export const CREATURES: Creature[] = [
  c('amsel', 'bird', 1, 1, 1, 1, 0),
  c('pinguin', 'bird', 1, 0, 1, 0, 1),
  c('huhn', 'bird', 1, 0, 1, 1, 0),
  c('adler', 'bird', 1, 1, 1, 0, 1),
  c('eule', 'bird', 1, 1, 1, 0, 0),
  c('hund', 'mammal', 0, 0, 0, 1, 1),
  c('fledermaus', 'mammal', 0, 1, 1, 0, 0),
  c('katze', 'mammal', 0, 0, 0, 1, 0),
  c('delfin', 'mammal', 0, 0, 0, 1, 1),
  c('maus', 'mammal', 0, 0, 0, 0, 1),
];

export const FEATURES: FeatureId[] = ['flies', 'brightPhoto', 'twoLegs', 'weekend', 'feathers'];

export interface FeatureResult {
  /** Gruppe für „ja“. */
  yes: Group;
  correct: number;
  total: number;
}

export function featureScore(feature: FeatureId, items: readonly Creature[] = CREATURES): FeatureResult {
  const yesBird = items.filter((x) => (x.has[feature] ? 'bird' : 'mammal') === x.group).length;
  const yesMammal = items.length - yesBird;
  return yesBird >= yesMammal ? { yes: 'bird', correct: yesBird, total: items.length } : { yes: 'mammal', correct: yesMammal, total: items.length };
}
