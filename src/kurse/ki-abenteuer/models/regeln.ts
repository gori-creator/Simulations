/**
 * Lektion „Hallo, ich bin Bit“: Bit sortiert Tiere mit festen Regeln.
 * Eine Regel besteht aus bis zu zwei Bedingungen (UND); passt sie, sagt Bit
 * „Katze“, sonst „Hund“. Mit diesen Merkmalen schafft keine Regel alle Tiere.
 */
export type Feature = 'ears' | 'size' | 'fur';
export type Animal = 'cat' | 'dog';

export interface Pet {
  id: string;
  kind: Animal;
  ears: 'pointy' | 'floppy';
  size: 'small' | 'big';
  fur: 'short' | 'long';
}

export interface Condition {
  feature: Feature;
  value: string;
}

export const PETS: Pet[] = [
  { id: 'hauskatze', kind: 'cat', ears: 'pointy', size: 'small', fur: 'short' },
  { id: 'perser', kind: 'cat', ears: 'pointy', size: 'small', fur: 'long' },
  { id: 'mainecoon', kind: 'cat', ears: 'pointy', size: 'big', fur: 'long' },
  { id: 'faltohr', kind: 'cat', ears: 'floppy', size: 'small', fur: 'short' },
  { id: 'dackel', kind: 'dog', ears: 'floppy', size: 'small', fur: 'short' },
  { id: 'husky', kind: 'dog', ears: 'pointy', size: 'big', fur: 'long' },
  { id: 'chihuahua', kind: 'dog', ears: 'pointy', size: 'small', fur: 'short' },
  { id: 'labrador', kind: 'dog', ears: 'floppy', size: 'big', fur: 'short' },
  { id: 'pudel', kind: 'dog', ears: 'floppy', size: 'small', fur: 'long' },
];

/** Alle wählbaren Bedingungen. */
export const CONDITIONS: Condition[] = [
  { feature: 'ears', value: 'pointy' },
  { feature: 'ears', value: 'floppy' },
  { feature: 'size', value: 'small' },
  { feature: 'size', value: 'big' },
  { feature: 'fur', value: 'short' },
  { feature: 'fur', value: 'long' },
];

/** Bits Antwort für ein Tier: alle Bedingungen erfüllt → Katze. Ohne Bedingung: immer Katze. */
export function classify(pet: Pet, rule: Condition[]): Animal {
  return rule.every((c) => pet[c.feature] === c.value) ? 'cat' : 'dog';
}

/** Wie viele Tiere Bit mit der Regel richtig einordnet. */
export function score(rule: Condition[], pets: Pet[] = PETS): number {
  return pets.filter((p) => classify(p, rule) === p.kind).length;
}

/** Beste erreichbare Punktzahl mit höchstens zwei Bedingungen. */
export function bestScore(pets: Pet[] = PETS): number {
  let best = score([], pets);
  CONDITIONS.forEach((a, i) => {
    best = Math.max(best, score([a], pets));
    CONDITIONS.slice(i + 1).forEach((b) => (best = Math.max(best, score([a, b], pets))));
  });
  return best;
}

/** Eindeutiger Schlüssel einer Regel (Reihenfolge egal). */
export function ruleKey(rule: Condition[]): string {
  return rule.map((c) => `${c.feature}=${c.value}`).sort().join('&');
}
